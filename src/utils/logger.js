/**
 * Sistema de Logging Dinámico - Luxery Prime Agency
 * Logging inteligente con niveles, contexto y análisis automático
 */

class DynamicLogger {
  constructor() {
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4
    };
    
    this.currentLevel = this.levels.INFO;
    this.logs = [];
    this.maxLogs = 1000;
    this.analytics = {
      errorCount: 0,
      warningCount: 0,
      performanceMetrics: [],
      userActions: []
    };
  }

  /**
   * Log dinámico con contexto automático
   * @param {string} level - Nivel del log
   * @param {string} message - Mensaje principal
   * @param {Object} context - Contexto adicional
   * @param {Object} metadata - Metadatos del sistema
   */
  log(level, message, context = {}, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      level,
      message,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId(),
        ...metadata
      },
      performance: this.getPerformanceMetrics(),
      stack: level === 'ERROR' ? new Error().stack : undefined
    };

    // Agregar al buffer de logs
    this.addToBuffer(logEntry);

    // Actualizar analytics
    this.updateAnalytics(logEntry);

    // Log condicional basado en nivel
    if (this.levels[level] <= this.currentLevel) {
      this.outputLog(logEntry);
    }

    // Auto-análisis de patrones
    this.analyzePatterns(logEntry);

    return logEntry;
  }

  /**
   * Log de error con análisis automático
   */
  error(message, error = null, context = {}) {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null
    };

    this.analytics.errorCount++;
    return this.log('ERROR', message, errorContext);
  }

  /**
   * Log de advertencia con sugerencias
   */
  warn(message, context = {}, suggestions = []) {
    const warnContext = {
      ...context,
      suggestions: suggestions.length > 0 ? suggestions : this.generateSuggestions(message)
    };

    this.analytics.warningCount++;
    return this.log('WARN', message, warnContext);
  }

  /**
   * Log de información con métricas
   */
  info(message, context = {}, metrics = {}) {
    const infoContext = {
      ...context,
      metrics: {
        ...metrics,
        memoryUsage: this.getMemoryUsage(),
        loadTime: this.getLoadTime()
      }
    };

    return this.log('INFO', message, infoContext);
  }

  /**
   * Log de debug con detalles técnicos
   */
  debug(message, context = {}, technicalDetails = {}) {
    const debugContext = {
      ...context,
      technical: {
        ...technicalDetails,
        timestamp: Date.now(),
        performance: performance.now(),
        memory: performance.memory
      }
    };

    return this.log('DEBUG', message, debugContext);
  }

  /**
   * Log de API con análisis automático
   */
  apiLog(method, url, status, responseTime, context = {}) {
    const apiContext = {
      method,
      url,
      status,
      responseTime,
      success: status >= 200 && status < 300,
      ...context
    };

    const level = apiContext.success ? 'INFO' : 'ERROR';
    const message = `API ${method} ${url} - ${status} (${responseTime}ms)`;

    return this.log(level, message, apiContext);
  }

  /**
   * Log de usuario con análisis de comportamiento
   */
  userAction(action, details = {}, context = {}) {
    const userContext = {
      action,
      details,
      timestamp: Date.now(),
      ...context
    };

    this.analytics.userActions.push(userContext);
    return this.log('INFO', `User Action: ${action}`, userContext);
  }

  /**
   * Análisis automático de patrones
   */
  analyzePatterns(logEntry) {
    // Detectar patrones de error
    if (logEntry.level === 'ERROR') {
      this.detectErrorPatterns(logEntry);
    }

    // Detectar patrones de rendimiento
    if (logEntry.context.performance) {
      this.detectPerformancePatterns(logEntry);
    }

    // Detectar patrones de usuario
    if (logEntry.context.action) {
      this.detectUserPatterns(logEntry);
    }
  }

  /**
   * Detectar patrones de error
   */
  detectErrorPatterns(logEntry) {
    const errorPatterns = {
      'API_ERROR': /API.*error/i,
      'NETWORK_ERROR': /network|fetch|connection/i,
      'VALIDATION_ERROR': /validation|invalid|required/i,
      'AUTH_ERROR': /auth|permission|unauthorized/i
    };

    for (const [pattern, regex] of Object.entries(errorPatterns)) {
      if (regex.test(logEntry.message)) {
        this.log('INFO', `Error Pattern Detected: ${pattern}`, {
          pattern,
          logId: logEntry.id,
          frequency: this.getErrorFrequency(pattern)
        });
      }
    }
  }

  /**
   * Detectar patrones de rendimiento
   */
  detectPerformancePatterns(logEntry) {
    const responseTime = logEntry.context.responseTime;
    if (responseTime > 2000) {
      this.warn('Slow API Response Detected', {
        responseTime,
        threshold: 2000,
        suggestion: 'Consider implementing caching or optimization'
      });
    }
  }

  /**
   * Detectar patrones de usuario
   */
  detectUserPatterns(logEntry) {
    const action = logEntry.context.action;
    const frequency = this.getUserActionFrequency(action);
    
    if (frequency > 10) {
      this.info('Frequent User Action', {
        action,
        frequency,
        suggestion: 'Consider optimizing this action for better UX'
      });
    }
  }

  /**
   * Generar sugerencias automáticas
   */
  generateSuggestions(message) {
    const suggestions = {
      'API': ['Check network connection', 'Verify API endpoint', 'Check authentication'],
      'VALIDATION': ['Check input format', 'Verify required fields', 'Check data types'],
      'PERFORMANCE': ['Implement caching', 'Optimize queries', 'Add loading states'],
      'AUTH': ['Check credentials', 'Verify permissions', 'Refresh token']
    };

    for (const [key, suggestionList] of Object.entries(suggestions)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return suggestionList;
      }
    }

    return ['Review logs for more details', 'Check system status', 'Contact support if needed'];
  }

  /**
   * Obtener métricas de rendimiento
   */
  getPerformanceMetrics() {
    return {
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      timing: {
        navigation: performance.timing.navigationStart,
        load: performance.timing.loadEventEnd - performance.timing.navigationStart,
        dom: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      }
    };
  }

  /**
   * Obtener ID de sesión
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('luxeryprime_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('luxeryprime_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Obtener uso de memoria
   */
  getMemoryUsage() {
    if (performance.memory) {
      return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
    }
    return null;
  }

  /**
   * Obtener tiempo de carga
   */
  getLoadTime() {
    return performance.timing.loadEventEnd - performance.timing.navigationStart;
  }

  /**
   * Agregar al buffer de logs
   */
  addToBuffer(logEntry) {
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Actualizar analytics
   */
  updateAnalytics(logEntry) {
    if (logEntry.context.responseTime) {
      this.analytics.performanceMetrics.push({
        timestamp: logEntry.timestamp,
        responseTime: logEntry.context.responseTime,
        url: logEntry.context.url
      });
    }
  }

  /**
   * Obtener frecuencia de errores
   */
  getErrorFrequency(pattern) {
    return this.logs.filter(log => 
      log.level === 'ERROR' && 
      log.message.toLowerCase().includes(pattern.toLowerCase())
    ).length;
  }

  /**
   * Obtener frecuencia de acciones de usuario
   */
  getUserActionFrequency(action) {
    return this.analytics.userActions.filter(userAction => 
      userAction.action === action
    ).length;
  }

  /**
   * Output del log
   */
  outputLog(logEntry) {
    const colors = {
      ERROR: '🔴',
      WARN: '🟡',
      INFO: '🔵',
      DEBUG: '🟢',
      TRACE: '⚪'
    };

    const emoji = colors[logEntry.level] || '⚪';
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    
    console.log(
      `${emoji} [${timestamp}] ${logEntry.level}: ${logEntry.message}`,
      logEntry.context
    );
  }

  /**
   * Obtener reporte de analytics
   */
  getAnalyticsReport() {
    return {
      summary: {
        totalLogs: this.logs.length,
        errorCount: this.analytics.errorCount,
        warningCount: this.analytics.warningCount,
        userActions: this.analytics.userActions.length
      },
      performance: {
        averageResponseTime: this.calculateAverageResponseTime(),
        slowestEndpoints: this.getSlowestEndpoints(),
        memoryUsage: this.getMemoryUsage()
      },
      patterns: {
        topErrors: this.getTopErrors(),
        topUserActions: this.getTopUserActions(),
        errorTrends: this.getErrorTrends()
      }
    };
  }

  /**
   * Calcular tiempo promedio de respuesta
   */
  calculateAverageResponseTime() {
    const responseTimes = this.analytics.performanceMetrics.map(m => m.responseTime);
    return responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
  }

  /**
   * Obtener endpoints más lentos
   */
  getSlowestEndpoints() {
    return this.analytics.performanceMetrics
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 5)
      .map(m => ({ url: m.url, responseTime: m.responseTime }));
  }

  /**
   * Obtener errores más frecuentes
   */
  getTopErrors() {
    const errorCounts = {};
    this.logs
      .filter(log => log.level === 'ERROR')
      .forEach(log => {
        const key = log.message;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });

    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));
  }

  /**
   * Obtener acciones de usuario más frecuentes
   */
  getTopUserActions() {
    const actionCounts = {};
    this.analytics.userActions.forEach(action => {
      actionCounts[action.action] = (actionCounts[action.action] || 0) + 1;
    });

    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));
  }

  /**
   * Obtener tendencias de errores
   */
  getErrorTrends() {
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recentErrors = this.logs.filter(log => 
      log.level === 'ERROR' && 
      new Date(log.timestamp).getTime() > last24Hours
    );

    return {
      last24Hours: recentErrors.length,
      trend: recentErrors.length > this.analytics.errorCount / 2 ? 'increasing' : 'stable'
    };
  }

  /**
   * Exportar logs para análisis
   */
  exportLogs(format = 'json') {
    const data = {
      logs: this.logs,
      analytics: this.getAnalyticsReport(),
      exportTime: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(data.logs);
    }

    return data;
  }

  /**
   * Convertir logs a CSV
   */
  convertToCSV(logs) {
    const headers = ['timestamp', 'level', 'message', 'context'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        `"${JSON.stringify(log.context).replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}

// Instancia global del logger
const logger = new DynamicLogger();

// Exportar para uso en toda la aplicación
export default logger;

// Exportar funciones específicas para conveniencia
export const { error, warn, info, debug, apiLog, userAction } = logger;
