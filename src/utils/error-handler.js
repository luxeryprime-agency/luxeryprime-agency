/**
 * Sistema de Manejo de Errores Robusto - Luxery Prime Agency
 * Manejo inteligente de errores con recuperación automática y análisis
 */

import logger from './logger.js';

class DynamicErrorHandler {
  constructor() {
    this.errorTypes = {
      NETWORK_ERROR: 'network',
      API_ERROR: 'api',
      VALIDATION_ERROR: 'validation',
      AUTH_ERROR: 'auth',
      DATABASE_ERROR: 'database',
      UNKNOWN_ERROR: 'unknown'
    };

    this.recoveryStrategies = {
      [this.errorTypes.NETWORK_ERROR]: this.handleNetworkError,
      [this.errorTypes.API_ERROR]: this.handleApiError,
      [this.errorTypes.VALIDATION_ERROR]: this.handleValidationError,
      [this.errorTypes.AUTH_ERROR]: this.handleAuthError,
      [this.errorTypes.DATABASE_ERROR]: this.handleDatabaseError,
      [this.errorTypes.UNKNOWN_ERROR]: this.handleUnknownError
    };

    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    };

    this.circuitBreaker = {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      states: {
        CLOSED: 'closed',
        OPEN: 'open',
        HALF_OPEN: 'half-open'
      },
      currentState: 'closed',
      failureCount: 0,
      lastFailureTime: null
    };
  }

  /**
   * Manejo principal de errores con análisis automático
   * @param {Error} error - Error original
   * @param {Object} context - Contexto del error
   * @param {Object} options - Opciones de manejo
   */
  async handleError(error, context = {}, options = {}) {
    const errorInfo = this.analyzeError(error, context);
    const errorType = this.classifyError(error, context);
    
    // Log del error con contexto completo
    logger.error(errorInfo.message, error, {
      ...context,
      errorType,
      errorId: errorInfo.id,
      timestamp: errorInfo.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Aplicar estrategia de recuperación
    const recoveryResult = await this.applyRecoveryStrategy(errorType, error, context, options);
    
    // Actualizar circuit breaker
    this.updateCircuitBreaker(errorType, recoveryResult.success);

    // Notificar al usuario si es necesario
    if (recoveryResult.notifyUser) {
      this.notifyUser(errorInfo, recoveryResult);
    }

    return {
      errorInfo,
      errorType,
      recoveryResult,
      handled: true
    };
  }

  /**
   * Análisis inteligente del error
   */
  analyzeError(error, context) {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: errorId,
      timestamp: new Date().toISOString(),
      name: error.name || 'UnknownError',
      message: error.message || 'An unknown error occurred',
      stack: error.stack,
      code: error.code,
      severity: this.calculateSeverity(error, context),
      impact: this.calculateImpact(error, context),
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Clasificación automática del error
   */
  classifyError(error, context) {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // Clasificación por mensaje
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      return this.errorTypes.NETWORK_ERROR;
    }

    if (errorMessage.includes('api') || errorMessage.includes('http') || errorMessage.includes('status')) {
      return this.errorTypes.API_ERROR;
    }

    if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('required')) {
      return this.errorTypes.VALIDATION_ERROR;
    }

    if (errorMessage.includes('auth') || errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      return this.errorTypes.AUTH_ERROR;
    }

    if (errorMessage.includes('database') || errorMessage.includes('firestore') || errorMessage.includes('query')) {
      return this.errorTypes.DATABASE_ERROR;
    }

    // Clasificación por código de error
    if (error.code) {
      if (error.code >= 400 && error.code < 500) {
        return error.code === 401 ? this.errorTypes.AUTH_ERROR : this.errorTypes.API_ERROR;
      }
      if (error.code >= 500) {
        return this.errorTypes.API_ERROR;
      }
    }

    return this.errorTypes.UNKNOWN_ERROR;
  }

  /**
   * Calcular severidad del error
   */
  calculateSeverity(error, context) {
    let severity = 1; // Baja por defecto

    // Aumentar severidad por tipo de error
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      severity += 2;
    }

    if (context.critical) {
      severity += 3;
    }

    if (context.userFacing) {
      severity += 1;
    }

    if (error.message.includes('security') || error.message.includes('auth')) {
      severity += 2;
    }

    return Math.min(severity, 5); // Máximo 5
  }

  /**
   * Calcular impacto del error
   */
  calculateImpact(error, context) {
    let impact = 'low';

    if (context.critical) {
      impact = 'high';
    } else if (context.userFacing) {
      impact = 'medium';
    }

    if (error.message.includes('payment') || error.message.includes('commission')) {
      impact = 'high';
    }

    return impact;
  }

  /**
   * Aplicar estrategia de recuperación
   */
  async applyRecoveryStrategy(errorType, error, context, options) {
    const strategy = this.recoveryStrategies[errorType];
    
    if (strategy) {
      return await strategy.call(this, error, context, options);
    }

    return this.handleUnknownError(error, context, options);
  }

  /**
   * Manejo de errores de red
   */
  async handleNetworkError(error, context, options) {
    // Verificar circuit breaker
    if (this.circuitBreaker.currentState === 'open') {
      return {
        success: false,
        action: 'circuit_breaker_open',
        message: 'Service temporarily unavailable',
        retryAfter: this.circuitBreaker.recoveryTimeout
      };
    }

    // Intentar reconexión automática
    if (options.retry !== false) {
      const retryResult = await this.retryOperation(context.operation, context.params);
      
      if (retryResult.success) {
        return {
          success: true,
          action: 'retry_successful',
          message: 'Operation completed after retry',
          data: retryResult.data
        };
      }
    }

    // Fallback a modo offline
    if (context.offlineCapable) {
      return {
        success: true,
        action: 'offline_mode',
        message: 'Switched to offline mode',
        data: await this.enableOfflineMode(context)
      };
    }

    return {
      success: false,
      action: 'network_error',
      message: 'Network connection failed',
      notifyUser: true,
      userMessage: 'Please check your internet connection and try again'
    };
  }

  /**
   * Manejo de errores de API
   */
  async handleApiError(error, context, options) {
    const statusCode = error.code || error.status;

    switch (statusCode) {
      case 401:
        return await this.handleAuthError(error, context, options);
      
      case 403:
        return {
          success: false,
          action: 'permission_denied',
          message: 'Insufficient permissions',
          notifyUser: true,
          userMessage: 'You do not have permission to perform this action'
        };
      
      case 404:
        return {
          success: false,
          action: 'not_found',
          message: 'Resource not found',
          notifyUser: true,
          userMessage: 'The requested resource was not found'
        };
      
      case 429:
        return {
          success: false,
          action: 'rate_limited',
          message: 'Rate limit exceeded',
          retryAfter: this.calculateRetryDelay(context),
          notifyUser: true,
          userMessage: 'Too many requests. Please wait a moment and try again'
        };
      
      case 500:
      case 502:
      case 503:
      case 504:
        return await this.handleServerError(error, context, options);
      
      default:
        return {
          success: false,
          action: 'api_error',
          message: `API error: ${error.message}`,
          notifyUser: true,
          userMessage: 'A server error occurred. Please try again later'
        };
    }
  }

  /**
   * Manejo de errores de validación
   */
  async handleValidationError(error, context, options) {
    const validationErrors = this.extractValidationErrors(error);
    
    return {
      success: false,
      action: 'validation_error',
      message: 'Validation failed',
      errors: validationErrors,
      notifyUser: true,
      userMessage: 'Please check your input and try again',
      suggestions: this.generateValidationSuggestions(validationErrors)
    };
  }

  /**
   * Manejo de errores de autenticación
   */
  async handleAuthError(error, context, options) {
    // Intentar renovar token
    const tokenRenewal = await this.renewAuthToken();
    
    if (tokenRenewal.success) {
      // Reintentar operación con nuevo token
      const retryResult = await this.retryOperation(context.operation, context.params);
      
      if (retryResult.success) {
        return {
          success: true,
          action: 'token_renewed',
          message: 'Authentication renewed successfully',
          data: retryResult.data
        };
      }
    }

    // Redirigir a login
    return {
      success: false,
      action: 'redirect_login',
      message: 'Authentication required',
      notifyUser: true,
      userMessage: 'Please log in to continue',
      redirectTo: '/login'
    };
  }

  /**
   * Manejo de errores de base de datos
   */
  async handleDatabaseError(error, context, options) {
    // Intentar reconexión
    const reconnection = await this.reconnectDatabase();
    
    if (reconnection.success) {
      const retryResult = await this.retryOperation(context.operation, context.params);
      
      if (retryResult.success) {
        return {
          success: true,
          action: 'database_reconnected',
          message: 'Database reconnected successfully',
          data: retryResult.data
        };
      }
    }

    return {
      success: false,
      action: 'database_error',
      message: 'Database operation failed',
      notifyUser: true,
      userMessage: 'A database error occurred. Please try again later'
    };
  }

  /**
   * Manejo de errores desconocidos
   */
  async handleUnknownError(error, context, options) {
    // Intentar recuperación genérica
    const genericRecovery = await this.attemptGenericRecovery(error, context);
    
    if (genericRecovery.success) {
      return genericRecovery;
    }

    return {
      success: false,
      action: 'unknown_error',
      message: 'An unexpected error occurred',
      notifyUser: true,
      userMessage: 'Something went wrong. Please try again or contact support',
      errorId: context.errorId
    };
  }

  /**
   * Reintentar operación con backoff exponencial
   */
  async retryOperation(operation, params, attempt = 1) {
    if (attempt > this.retryConfig.maxRetries) {
      return { success: false, error: 'Max retries exceeded' };
    }

    try {
      const result = await operation(...params);
      return { success: true, data: result };
    } catch (error) {
      const delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
        this.retryConfig.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryOperation(operation, params, attempt + 1);
    }
  }

  /**
   * Actualizar circuit breaker
   */
  updateCircuitBreaker(errorType, success) {
    if (success) {
      this.circuitBreaker.failureCount = 0;
      this.circuitBreaker.currentState = this.circuitBreaker.states.CLOSED;
    } else {
      this.circuitBreaker.failureCount++;
      this.circuitBreaker.lastFailureTime = Date.now();

      if (this.circuitBreaker.failureCount >= this.circuitBreaker.failureThreshold) {
        this.circuitBreaker.currentState = this.circuitBreaker.states.OPEN;
        
        // Programar recuperación
        setTimeout(() => {
          this.circuitBreaker.currentState = this.circuitBreaker.states.HALF_OPEN;
        }, this.circuitBreaker.recoveryTimeout);
      }
    }
  }

  /**
   * Notificar al usuario
   */
  notifyUser(errorInfo, recoveryResult) {
    const notification = {
      type: recoveryResult.success ? 'success' : 'error',
      title: recoveryResult.success ? 'Operation Completed' : 'Error Occurred',
      message: recoveryResult.userMessage || errorInfo.message,
      duration: recoveryResult.success ? 3000 : 5000,
      actions: recoveryResult.suggestions || []
    };

    // Implementar notificación (Toast, Modal, etc.)
    this.showNotification(notification);
  }

  /**
   * Mostrar notificación
   */
  showNotification(notification) {
    // Implementación de notificación
    console.log(`🔔 ${notification.type.toUpperCase()}: ${notification.message}`);
    
    // Aquí se integraría con el sistema de notificaciones
    // Por ejemplo: toast, modal, snackbar, etc.
  }

  /**
   * Extraer errores de validación
   */
  extractValidationErrors(error) {
    if (error.errors) {
      return error.errors;
    }

    if (error.message.includes('required')) {
      return [{ field: 'unknown', message: 'This field is required' }];
    }

    if (error.message.includes('invalid')) {
      return [{ field: 'unknown', message: 'Invalid format' }];
    }

    return [{ field: 'unknown', message: error.message }];
  }

  /**
   * Generar sugerencias de validación
   */
  generateValidationSuggestions(errors) {
    const suggestions = [];

    errors.forEach(error => {
      if (error.field === 'email') {
        suggestions.push('Please enter a valid email address');
      } else if (error.field === 'phone') {
        suggestions.push('Please enter a valid phone number');
      } else if (error.field === 'password') {
        suggestions.push('Password must be at least 8 characters long');
      }
    });

    return suggestions;
  }

  /**
   * Calcular delay de reintento
   */
  calculateRetryDelay(context) {
    const baseDelay = 1000;
    const multiplier = context.retryCount || 1;
    return Math.min(baseDelay * multiplier, 30000);
  }

  /**
   * Habilitar modo offline
   */
  async enableOfflineMode(context) {
    // Implementar lógica de modo offline
    return {
      offline: true,
      message: 'Working in offline mode',
      data: context.cachedData || null
    };
  }

  /**
   * Renovar token de autenticación
   */
  async renewAuthToken() {
    try {
      // Implementar renovación de token
      return { success: true, token: 'new_token' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reconectar a base de datos
   */
  async reconnectDatabase() {
    try {
      // Implementar reconexión a base de datos
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Intentar recuperación genérica
   */
  async attemptGenericRecovery(error, context) {
    // Implementar recuperación genérica
    return { success: false, error: 'Generic recovery not available' };
  }

  /**
   * Obtener reporte de errores
   */
  getErrorReport() {
    return {
      circuitBreaker: this.circuitBreaker,
      retryConfig: this.retryConfig,
      errorTypes: this.errorTypes
    };
  }
}

// Instancia global del manejador de errores
const errorHandler = new DynamicErrorHandler();

// Exportar para uso en toda la aplicación
export default errorHandler;

// Exportar funciones específicas para conveniencia
export const { handleError, errorTypes } = errorHandler;
