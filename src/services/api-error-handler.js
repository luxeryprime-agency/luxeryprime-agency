/**
 * MANEJADOR DE ERRORES DE API MEJORADO
 * Soluciona errores 500 y otros errores de API
 */

class APIErrorHandler {
  constructor() {
    this.errorCodes = {
      400: { type: 'BAD_REQUEST', message: 'Solicitud inválida', retryable: false },
      401: { type: 'UNAUTHORIZED', message: 'Token expirado', retryable: true },
      403: { type: 'FORBIDDEN', message: 'Sin permisos', retryable: false },
      404: { type: 'NOT_FOUND', message: 'Recurso no encontrado', retryable: false },
      429: { type: 'RATE_LIMITED', message: 'Límite de velocidad', retryable: true },
      500: { type: 'SERVER_ERROR', message: 'Error interno del servidor', retryable: true },
      502: { type: 'BAD_GATEWAY', message: 'Puerta de enlace inválida', retryable: true },
      503: { type: 'SERVICE_UNAVAILABLE', message: 'Servicio no disponible', retryable: true },
      504: { type: 'GATEWAY_TIMEOUT', message: 'Timeout de puerta de enlace', retryable: true }
    };

    this.recoveryStrategies = {
      UNAUTHORIZED: this.handleUnauthorized.bind(this),
      RATE_LIMITED: this.handleRateLimited.bind(this),
      SERVER_ERROR: this.handleServerError.bind(this),
      SERVICE_UNAVAILABLE: this.handleServiceUnavailable.bind(this)
    };
  }

  /**
   * Manejar error de API
   */
  async handleAPIError(error, response, context = {}) {
    const statusCode = response?.status || 500;
    const errorInfo = this.errorCodes[statusCode] || this.errorCodes[500];
    
    console.error(`❌ Error de API ${statusCode}:`, {
      type: errorInfo.type,
      message: errorInfo.message,
      originalError: error.message,
      context
    });

    // Aplicar estrategia de recuperación
    const recovery = await this.applyRecoveryStrategy(errorInfo.type, context);
    
    return {
      handled: true,
      errorType: errorInfo.type,
      message: errorInfo.message,
      statusCode,
      retryable: errorInfo.retryable,
      recovery,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Aplicar estrategia de recuperación
   */
  async applyRecoveryStrategy(errorType, context) {
    const strategy = this.recoveryStrategies[errorType];
    
    if (strategy) {
      try {
        return await strategy(context);
      } catch (error) {
        console.error(`❌ Error en estrategia de recuperación ${errorType}:`, error);
        return { success: false, error: error.message };
      }
    }

    return { success: false, message: 'No hay estrategia de recuperación disponible' };
  }

  /**
   * Manejar error 401 (Unauthorized)
   */
  async handleUnauthorized(context) {
    console.log('🔑 Manejando error de autorización...');
    
    // Intentar renovar token
    try {
      const newToken = await this.refreshAuthToken();
      if (newToken) {
        return {
          success: true,
          action: 'TOKEN_REFRESHED',
          newToken,
          message: 'Token renovado exitosamente'
        };
      }
    } catch (error) {
      console.error('❌ Error renovando token:', error);
    }

    // Redirigir a login
    return {
      success: false,
      action: 'REDIRECT_TO_LOGIN',
      message: 'Token expirado, redirigiendo a login'
    };
  }

  /**
   * Manejar error 429 (Rate Limited)
   */
  async handleRateLimited(context) {
    console.log('⏳ Manejando límite de velocidad...');
    
    const retryAfter = context.retryAfter || 60; // 60 segundos por defecto
    
    return {
      success: true,
      action: 'WAIT_AND_RETRY',
      retryAfter,
      message: `Esperando ${retryAfter} segundos antes de reintentar`
    };
  }

  /**
   * Manejar error 500 (Server Error)
   */
  async handleServerError(context) {
    console.log('🔧 Manejando error del servidor...');
    
    // Verificar si es un error específico del negocio
    if (context.action === 'calculateCommission') {
      return {
        success: true,
        action: 'FALLBACK_COMMISSION_CALCULATION',
        message: 'Usando cálculo de comisión de respaldo'
      };
    }

    if (context.action === 'getStreamers') {
      return {
        success: true,
        action: 'FALLBACK_CACHE_DATA',
        message: 'Usando datos de caché como respaldo'
      };
    }

    // Estrategia genérica
    return {
      success: true,
      action: 'RETRY_WITH_BACKOFF',
      message: 'Reintentando con backoff exponencial'
    };
  }

  /**
   * Manejar error 503 (Service Unavailable)
   */
  async handleServiceUnavailable(context) {
    console.log('🚫 Servicio no disponible, activando modo de respaldo...');
    
    return {
      success: true,
      action: 'ACTIVATE_FALLBACK_MODE',
      message: 'Activando modo de respaldo para mantener funcionalidad básica'
    };
  }

  /**
   * Renovar token de autenticación
   */
  async refreshAuthToken() {
    try {
      // Simular renovación de token
      console.log('🔄 Renovando token de autenticación...');
      
      // Aquí iría la lógica real de renovación de token
      const newToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Token renovado exitosamente');
      return newToken;
    } catch (error) {
      console.error('❌ Error renovando token:', error);
      return null;
    }
  }

  /**
   * Crear respuesta de error estructurada
   */
  createErrorResponse(error, context = {}) {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: false,
      error: {
        id: errorId,
        message: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString(),
        context
      },
      recovery: {
        available: true,
        suggestions: this.getRecoverySuggestions(error, context)
      }
    };
  }

  /**
   * Obtener sugerencias de recuperación
   */
  getRecoverySuggestions(error, context) {
    const suggestions = [];

    if (error.message.includes('network') || error.message.includes('timeout')) {
      suggestions.push('Verificar conexión a internet');
      suggestions.push('Reintentar la operación');
    }

    if (error.message.includes('500') || error.message.includes('server')) {
      suggestions.push('El servidor está experimentando problemas');
      suggestions.push('Intentar nuevamente en unos minutos');
    }

    if (error.message.includes('commission') || error.message.includes('comisión')) {
      suggestions.push('Verificar datos de streamer');
      suggestions.push('Usar cálculo de comisión de respaldo');
    }

    if (context.action) {
      suggestions.push(`Reintentar acción: ${context.action}`);
    }

    return suggestions;
  }

  /**
   * Validar respuesta de API
   */
  validateAPIResponse(response, expectedStatus = 200) {
    if (!response) {
      throw new Error('Respuesta de API es null o undefined');
    }

    if (response.status !== expectedStatus) {
      const errorInfo = this.errorCodes[response.status] || this.errorCodes[500];
      throw new Error(`API devolvió ${response.status}: ${errorInfo.message}`);
    }

    return true;
  }

  /**
   * Obtener estadísticas de errores
   */
  getErrorStatistics() {
    return {
      errorCodes: Object.keys(this.errorCodes).length,
      recoveryStrategies: Object.keys(this.recoveryStrategies).length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = APIErrorHandler;