/**
 * MANEJADOR DE AUTENTICACIÓN MEJORADO
 * Soluciona errores de autenticación y autorización
 */

class AuthManager {
  constructor() {
    this.tokens = new Map();
    this.refreshTokens = new Map();
    this.permissions = new Map();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
    this.refreshThreshold = 5 * 60 * 1000; // 5 minutos antes de expirar
  }

  /**
   * Validar token de autenticación
   */
  validateToken(token, requiredPermissions = []) {
    if (!token) {
      return {
        valid: false,
        error: 'Token no proporcionado',
        action: 'LOGIN_REQUIRED'
      };
    }

    const tokenData = this.tokens.get(token);
    
    if (!tokenData) {
      return {
        valid: false,
        error: 'Token inválido o expirado',
        action: 'LOGIN_REQUIRED'
      };
    }

    // Verificar expiración
    if (Date.now() > tokenData.expiresAt) {
      this.tokens.delete(token);
      return {
        valid: false,
        error: 'Token expirado',
        action: 'REFRESH_TOKEN'
      };
    }

    // Verificar permisos
    if (requiredPermissions.length > 0) {
      const hasPermissions = requiredPermissions.every(permission => 
        tokenData.permissions.includes(permission)
      );

      if (!hasPermissions) {
        return {
          valid: false,
          error: 'Permisos insuficientes',
          action: 'PERMISSION_DENIED',
          required: requiredPermissions,
          current: tokenData.permissions
        };
      }
    }

    // Verificar si necesita refresh
    const needsRefresh = Date.now() > (tokenData.expiresAt - this.refreshThreshold);
    
    return {
      valid: true,
      needsRefresh,
      user: tokenData.user,
      permissions: tokenData.permissions,
      expiresAt: tokenData.expiresAt
    };
  }

  /**
   * Crear token de autenticación
   */
  createToken(user, permissions = []) {
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + this.sessionTimeout;
    
    const tokenData = {
      user,
      permissions,
      expiresAt,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };

    this.tokens.set(token, tokenData);
    
    // Crear refresh token
    const refreshToken = this.createRefreshToken(token);
    
    return {
      token,
      refreshToken,
      expiresAt,
      permissions
    };
  }

  /**
   * Crear refresh token
   */
  createRefreshToken(originalToken) {
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas
    
    this.refreshTokens.set(refreshToken, {
      originalToken,
      expiresAt,
      createdAt: Date.now()
    });

    return refreshToken;
  }

  /**
   * Renovar token usando refresh token
   */
  refreshToken(refreshToken) {
    const refreshData = this.refreshTokens.get(refreshToken);
    
    if (!refreshData) {
      return {
        success: false,
        error: 'Refresh token inválido',
        action: 'LOGIN_REQUIRED'
      };
    }

    if (Date.now() > refreshData.expiresAt) {
      this.refreshTokens.delete(refreshToken);
      return {
        success: false,
        error: 'Refresh token expirado',
        action: 'LOGIN_REQUIRED'
      };
    }

    const originalTokenData = this.tokens.get(refreshData.originalToken);
    
    if (!originalTokenData) {
      this.refreshTokens.delete(refreshToken);
      return {
        success: false,
        error: 'Token original no encontrado',
        action: 'LOGIN_REQUIRED'
      };
    }

    // Crear nuevo token
    const newToken = this.createToken(originalTokenData.user, originalTokenData.permissions);
    
    // Limpiar tokens antiguos
    this.tokens.delete(refreshData.originalToken);
    this.refreshTokens.delete(refreshToken);

    return {
      success: true,
      ...newToken
    };
  }

  /**
   * Verificar permisos específicos
   */
  checkPermissions(token, resource, action) {
    const validation = this.validateToken(token);
    
    if (!validation.valid) {
      return validation;
    }

    const requiredPermission = `${resource}:${action}`;
    const hasPermission = validation.permissions.includes(requiredPermission) ||
                         validation.permissions.includes(`${resource}:*`) ||
                         validation.permissions.includes('*');

    if (!hasPermission) {
      return {
        valid: false,
        error: `Permiso requerido: ${requiredPermission}`,
        action: 'PERMISSION_DENIED',
        required: requiredPermission,
        current: validation.permissions
      };
    }

    return {
      valid: true,
      user: validation.user,
      permission: requiredPermission
    };
  }

  /**
   * Manejar error de autenticación
   */
  handleAuthError(error, context = {}) {
    console.error('🔐 Error de autenticación:', error.message);

    if (error.message.includes('expired') || error.message.includes('expirado')) {
      return {
        type: 'TOKEN_EXPIRED',
        message: 'Tu sesión ha expirado',
        action: 'REFRESH_TOKEN',
        retryable: true
      };
    }

    if (error.message.includes('invalid') || error.message.includes('inválido')) {
      return {
        type: 'TOKEN_INVALID',
        message: 'Token de autenticación inválido',
        action: 'LOGIN_REQUIRED',
        retryable: false
      };
    }

    if (error.message.includes('permission') || error.message.includes('permiso')) {
      return {
        type: 'PERMISSION_DENIED',
        message: 'No tienes permisos para realizar esta acción',
        action: 'CONTACT_ADMIN',
        retryable: false
      };
    }

    return {
      type: 'AUTH_ERROR',
      message: 'Error de autenticación',
      action: 'LOGIN_REQUIRED',
      retryable: false
    };
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(token) {
    const validation = this.validateToken(token);
    
    if (!validation.valid) {
      return null;
    }

    return validation.user;
  }

  /**
   * Cerrar sesión
   */
  logout(token) {
    const tokenData = this.tokens.get(token);
    
    if (tokenData) {
      // Encontrar y eliminar refresh token asociado
      for (const [refreshToken, refreshData] of this.refreshTokens.entries()) {
        if (refreshData.originalToken === token) {
          this.refreshTokens.delete(refreshToken);
          break;
        }
      }
      
      this.tokens.delete(token);
    }

    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    };
  }

  /**
   * Limpiar tokens expirados
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    let cleaned = 0;

    // Limpiar tokens expirados
    for (const [token, tokenData] of this.tokens.entries()) {
      if (now > tokenData.expiresAt) {
        this.tokens.delete(token);
        cleaned++;
      }
    }

    // Limpiar refresh tokens expirados
    for (const [refreshToken, refreshData] of this.refreshTokens.entries()) {
      if (now > refreshData.expiresAt) {
        this.refreshTokens.delete(refreshToken);
        cleaned++;
      }
    }

    console.log(`🧹 Limpieza completada: ${cleaned} tokens eliminados`);
    return cleaned;
  }

  /**
   * Obtener estadísticas de autenticación
   */
  getAuthStatistics() {
    const now = Date.now();
    const activeTokens = Array.from(this.tokens.values()).filter(
      token => now < token.expiresAt
    ).length;

    const expiredTokens = Array.from(this.tokens.values()).filter(
      token => now >= token.expiresAt
    ).length;

    return {
      activeTokens,
      expiredTokens,
      totalRefreshTokens: this.refreshTokens.size,
      sessionTimeout: this.sessionTimeout,
      refreshThreshold: this.refreshThreshold
    };
  }

  /**
   * Crear usuario de prueba para testing
   */
  createTestUser() {
    const testUser = {
      id: 'test_user_001',
      email: 'test@luxeryprimeagency.com',
      name: 'Usuario de Prueba',
      role: 'admin'
    };

    const permissions = [
      'streamers:read',
      'streamers:write',
      'commissions:read',
      'commissions:write',
      'agencies:read',
      'agencies:write',
      '*'
    ];

    return this.createToken(testUser, permissions);
  }
}

module.exports = AuthManager;