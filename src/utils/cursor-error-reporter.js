/**
 * CURSOR AI ERROR REPORTER
 * Sistema de análisis de errores y generación de reportes de mejora
 * Basado en el análisis del documento de arquitectura
 */

class CursorErrorReporter {
  constructor() {
    this.errorAnalysis = {
      totalErrors: 0,
      criticalErrors: 0,
      resolvedErrors: 0,
      patterns: new Map(),
      trends: [],
      improvements: []
    };
    
    this.reportTemplates = {
      daily: this.generateDailyReport.bind(this),
      weekly: this.generateWeeklyReport.bind(this),
      monthly: this.generateMonthlyReport.bind(this),
      realtime: this.generateRealtimeReport.bind(this)
    };
  }

  /**
   * Analizar error y generar reporte de mejora
   */
  analyzeError(error, context = {}) {
    const analysis = {
      id: `ERROR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name,
        severity: this.calculateSeverity(error, context)
      },
      context,
      patterns: this.detectErrorPatterns(error, context),
      category: this.categorizeError(error, context),
      improvements: this.generateImprovements(error, context),
      autoFix: this.suggestAutoFix(error, context),
      priority: this.calculatePriority(error, context),
      businessImpact: this.assessBusinessImpact(error, context)
    };

    this.updateErrorAnalysis(analysis);
    return analysis;
  }

  /**
   * Calcular severidad del error
   */
  calculateSeverity(error, context) {
    let severity = 1;

    // Aumentar severidad basado en contexto
    if (context.critical) severity += 3;
    if (context.userFacing) severity += 2;
    if (context.production) severity += 2;
    if (context.retryable) severity += 1;

    // Aumentar severidad basado en tipo de error
    const errorType = error.constructor.name;
    if (errorType === 'TypeError') severity += 1;
    if (errorType === 'ReferenceError') severity += 2;
    if (errorType === 'SyntaxError') severity += 3;
    if (errorType === 'NetworkError') severity += 2;

    // Aumentar severidad basado en frecuencia
    const patterns = this.detectErrorPatterns(error, context);
    if (patterns.some(p => p.frequency > 5)) severity += 2;

    return Math.min(severity, 5);
  }

  /**
   * Detectar patrones de error
   */
  detectErrorPatterns(error, context) {
    const patterns = [];
    const message = error.message.toLowerCase();
    const stack = error.stack || '';

    // Patrones específicos del negocio de streamers
    if (message.includes('commission') || message.includes('comisión')) {
      patterns.push({
        type: 'COMMISSION_PATTERN',
        description: 'Error relacionado con cálculo de comisiones',
        frequency: this.getPatternFrequency('COMMISSION_PATTERN'),
        confidence: 0.9,
        businessImpact: 'HIGH'
      });
    }

    if (message.includes('streamer') || message.includes('streamers')) {
      patterns.push({
        type: 'STREAMER_PATTERN',
        description: 'Error relacionado con gestión de streamers',
        frequency: this.getPatternFrequency('STREAMER_PATTERN'),
        confidence: 0.85,
        businessImpact: 'HIGH'
      });
    }

    if (message.includes('agency') || message.includes('agencia')) {
      patterns.push({
        type: 'AGENCY_PATTERN',
        description: 'Error relacionado con gestión de agencias',
        frequency: this.getPatternFrequency('AGENCY_PATTERN'),
        confidence: 0.8,
        businessImpact: 'MEDIUM'
      });
    }

    // Patrones técnicos
    if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
      patterns.push({
        type: 'NETWORK_PATTERN',
        description: 'Error de conectividad de red',
        frequency: this.getPatternFrequency('NETWORK_PATTERN'),
        confidence: 0.9,
        businessImpact: 'HIGH'
      });
    }

    if (message.includes('api') || message.includes('http') || message.includes('500') || message.includes('404')) {
      patterns.push({
        type: 'API_PATTERN',
        description: 'Error en llamada a API',
        frequency: this.getPatternFrequency('API_PATTERN'),
        confidence: 0.85,
        businessImpact: 'HIGH'
      });
    }

    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      patterns.push({
        type: 'VALIDATION_PATTERN',
        description: 'Error de validación de datos',
        frequency: this.getPatternFrequency('VALIDATION_PATTERN'),
        confidence: 0.8,
        businessImpact: 'MEDIUM'
      });
    }

    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      patterns.push({
        type: 'AUTH_PATTERN',
        description: 'Error de autenticación',
        frequency: this.getPatternFrequency('AUTH_PATTERN'),
        confidence: 0.9,
        businessImpact: 'HIGH'
      });
    }

    // Patrones de rendimiento específicos del negocio
    if (context.responseTime && context.responseTime > 1000) {
      patterns.push({
        type: 'PERFORMANCE_PATTERN',
        description: 'Problema de rendimiento detectado',
        frequency: this.getPatternFrequency('PERFORMANCE_PATTERN'),
        confidence: 0.7,
        businessImpact: 'MEDIUM'
      });
    }

    if (message.includes('memory') || message.includes('out of memory')) {
      patterns.push({
        type: 'MEMORY_PATTERN',
        description: 'Problema de memoria',
        frequency: this.getPatternFrequency('MEMORY_PATTERN'),
        confidence: 0.95,
        businessImpact: 'HIGH'
      });
    }

    return patterns;
  }

  /**
   * Categorizar error
   */
  categorizeError(error, context) {
    const patterns = this.detectErrorPatterns(error, context);
    
    // Categorías específicas del negocio
    if (patterns.some(p => p.type === 'COMMISSION_PATTERN')) return 'COMMISSION_CALCULATION';
    if (patterns.some(p => p.type === 'STREAMER_PATTERN')) return 'STREAMER_MANAGEMENT';
    if (patterns.some(p => p.type === 'AGENCY_PATTERN')) return 'AGENCY_MANAGEMENT';
    
    // Categorías técnicas
    if (patterns.some(p => p.type === 'NETWORK_PATTERN')) return 'NETWORK';
    if (patterns.some(p => p.type === 'API_PATTERN')) return 'API';
    if (patterns.some(p => p.type === 'VALIDATION_PATTERN')) return 'VALIDATION';
    if (patterns.some(p => p.type === 'AUTH_PATTERN')) return 'AUTHENTICATION';
    if (patterns.some(p => p.type === 'PERFORMANCE_PATTERN')) return 'PERFORMANCE';
    if (patterns.some(p => p.type === 'MEMORY_PATTERN')) return 'MEMORY';
    
    return 'UNKNOWN';
  }

  /**
   * Generar mejoras sugeridas
   */
  generateImprovements(error, context) {
    const improvements = [];
    const patterns = this.detectErrorPatterns(error, context);
    const category = this.categorizeError(error, context);

    // Mejoras específicas del negocio de streamers
    switch (category) {
      case 'COMMISSION_CALCULATION':
        improvements.push({
          type: 'COMMISSION_OPTIMIZATION',
          description: 'Optimizar algoritmo de cálculo de comisiones',
          priority: 'HIGH',
          effort: 'MEDIUM',
          businessImpact: 'Reducir errores de cálculo en 95%',
          code: `
// Optimización de cálculo de comisiones
class CommissionCalculator {
  constructor() {
    this.cache = new Map();
    this.validationRules = this.loadValidationRules();
  }
  
  async calculateCommission(streamerData, period) {
    // Validar datos antes del cálculo
    const validation = this.validateStreamerData(streamerData);
    if (!validation.isValid) {
      throw new ValidationError('Datos de streamer inválidos', validation.errors);
    }
    
    // Usar caché para cálculos repetitivos
    const cacheKey = \`\${streamerData.id}_\${period}\`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Cálculo optimizado
    const commission = await this.performCalculation(streamerData, period);
    
    // Guardar en caché
    this.cache.set(cacheKey, commission);
    
    return commission;
  }
  
  validateStreamerData(data) {
    const errors = [];
    
    if (!data.id) errors.push('ID de streamer requerido');
    if (!data.earnings || data.earnings < 0) errors.push('Ganancias inválidas');
    if (!data.level || data.level < 1) errors.push('Nivel inválido');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}`
        });
        break;

      case 'STREAMER_MANAGEMENT':
        improvements.push({
          type: 'STREAMER_VALIDATION',
          description: 'Implementar validación robusta de datos de streamers',
          priority: 'HIGH',
          effort: 'LOW',
          businessImpact: 'Reducir errores de datos en 90%',
          code: `
// Validación robusta de streamers
const streamerValidationSchema = {
  id: { required: true, type: 'string', minLength: 1 },
  name: { required: true, type: 'string', minLength: 2 },
  email: { required: true, type: 'email', pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ },
  country: { required: true, type: 'string', enum: ['Colombia', 'México', 'Venezuela', 'Perú'] },
  level: { required: true, type: 'number', min: 1, max: 5 },
  earnings: { required: true, type: 'number', min: 0 },
  binanceEmail: { required: false, type: 'email' }
};

function validateStreamer(streamerData) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(streamerValidationSchema)) {
    const value = streamerData[field];
    
    if (rules.required && (!value || value === '')) {
      errors.push({ field, message: \`\${field} es requerido\` });
    }
    
    if (value && rules.type === 'email' && !rules.pattern.test(value)) {
      errors.push({ field, message: \`\${field} debe ser un email válido\` });
    }
    
    if (value && rules.type === 'number' && (isNaN(value) || value < rules.min || value > rules.max)) {
      errors.push({ field, message: \`\${field} debe ser un número entre \${rules.min} y \${rules.max}\` });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}`
        });
        break;

      case 'AGENCY_MANAGEMENT':
        improvements.push({
          type: 'AGENCY_SYNC',
          description: 'Implementar sincronización automática entre agencias',
          priority: 'MEDIUM',
          effort: 'HIGH',
          businessImpact: 'Mejorar consistencia de datos entre agencias',
          code: `
// Sincronización automática de agencias
class AgencySyncManager {
  constructor() {
    this.syncQueue = [];
    this.syncInterval = 30000; // 30 segundos
    this.startSync();
  }
  
  async syncAgencies() {
    const agencies = await this.getAgencies();
    
    for (const agency of agencies) {
      try {
        await this.syncAgencyData(agency);
      } catch (error) {
        console.error(\`Error sincronizando agencia \${agency.id}:\`, error);
        this.queueForRetry(agency);
      }
    }
  }
  
  async syncAgencyData(agency) {
    // Sincronizar streamers
    await this.syncStreamers(agency);
    
    // Sincronizar comisiones
    await this.syncCommissions(agency);
    
    // Sincronizar configuraciones
    await this.syncConfigurations(agency);
  }
}`
        });
        break;

      // Mejoras técnicas (mantener las del archivo anterior)
      case 'NETWORK':
        improvements.push({
          type: 'RETRY_MECHANISM',
          description: 'Implementar mecanismo de reintento con backoff exponencial',
          priority: 'HIGH',
          effort: 'MEDIUM',
          businessImpact: 'Reducir fallos de conectividad en 80%',
          code: `
// Implementar retry con backoff exponencial
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}`
        });
        break;

      case 'API':
        improvements.push({
          type: 'ERROR_HANDLING',
          description: 'Mejorar manejo de errores de API con códigos de estado específicos',
          priority: 'HIGH',
          effort: 'LOW',
          businessImpact: 'Mejorar experiencia de usuario en 60%',
          code: `
// Manejo específico de errores de API
function handleApiError(error, response) {
  switch (response?.status) {
    case 400:
      return { type: 'BAD_REQUEST', message: 'Solicitud inválida', retryable: false };
    case 401:
      return { type: 'UNAUTHORIZED', message: 'Token expirado', retryable: true };
    case 403:
      return { type: 'FORBIDDEN', message: 'Sin permisos', retryable: false };
    case 404:
      return { type: 'NOT_FOUND', message: 'Recurso no encontrado', retryable: false };
    case 429:
      return { type: 'RATE_LIMITED', message: 'Límite de velocidad', retryable: true };
    case 500:
      return { type: 'SERVER_ERROR', message: 'Error del servidor', retryable: true };
    default:
      return { type: 'UNKNOWN', message: 'Error desconocido', retryable: true };
  }
}`
        });
        break;
    }

    // Mejoras generales basadas en patrones
    if (patterns.some(p => p.frequency > 3)) {
      improvements.push({
        type: 'MONITORING',
        description: 'Implementar monitoreo proactivo para detectar patrones de error',
        priority: 'HIGH',
        effort: 'MEDIUM',
        businessImpact: 'Detectar problemas antes de que afecten usuarios',
        code: `
// Monitoreo proactivo
class ErrorMonitor {
  constructor() {
    this.errorCounts = new Map();
    this.thresholds = new Map();
  }
  
  trackError(error, context) {
    const key = this.getErrorKey(error);
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);
    
    if (count > this.thresholds.get(key)) {
      this.alert(error, context);
    }
  }
  
  getErrorKey(error) {
    return \`\${error.constructor.name}:\${error.message}\`;
  }
  
  alert(error, context) {
    // Enviar alerta a sistema de monitoreo
    console.warn('🚨 Patrón de error detectado:', error, context);
  }
}`
      });
    }

    return improvements;
  }

  /**
   * Sugerir corrección automática
   */
  suggestAutoFix(error, context) {
    const category = this.categorizeError(error, context);
    const patterns = this.detectErrorPatterns(error, context);

    const autoFixes = [];

    // Correcciones automáticas específicas del negocio
    switch (category) {
      case 'COMMISSION_CALCULATION':
        autoFixes.push({
          type: 'AUTO_VALIDATION',
          description: 'Aplicar validación automática de datos de comisión',
          confidence: 0.9,
          code: `
// Aplicar validación automática de comisiones
const validation = validateCommissionData(commissionData);
if (!validation.isValid) {
  throw new ValidationError('Datos de comisión inválidos', validation.errors);
}`
        });
        break;

      case 'STREAMER_MANAGEMENT':
        autoFixes.push({
          type: 'AUTO_CLEANUP',
          description: 'Limpiar y normalizar datos de streamer automáticamente',
          confidence: 0.8,
          code: `
// Limpiar datos de streamer automáticamente
const cleanedData = {
  ...streamerData,
  email: streamerData.email.toLowerCase().trim(),
  name: streamerData.name.trim(),
  country: streamerData.country.charAt(0).toUpperCase() + streamerData.country.slice(1).toLowerCase()
};`
        });
        break;

      case 'NETWORK':
        autoFixes.push({
          type: 'AUTO_RETRY',
          description: 'Reintentar automáticamente la operación',
          confidence: 0.8,
          code: `
// Aplicar retry automático
const result = await retryWithBackoff(() => {
  return fetch(url, options);
});`
        });
        break;
    }

    return autoFixes;
  }

  /**
   * Calcular prioridad de corrección
   */
  calculatePriority(error, context) {
    let priority = 1;

    // Aumentar prioridad basado en severidad
    const severity = this.calculateSeverity(error, context);
    priority += severity;

    // Aumentar prioridad basado en frecuencia
    const patterns = this.detectErrorPatterns(error, context);
    const maxFrequency = Math.max(...patterns.map(p => p.frequency));
    priority += Math.min(maxFrequency, 3);

    // Aumentar prioridad basado en contexto
    if (context.critical) priority += 2;
    if (context.userFacing) priority += 1;
    if (context.production) priority += 2;

    // Aumentar prioridad basado en impacto del negocio
    const businessImpact = this.assessBusinessImpact(error, context);
    if (businessImpact === 'HIGH') priority += 2;
    if (businessImpact === 'MEDIUM') priority += 1;

    return Math.min(priority, 5);
  }

  /**
   * Evaluar impacto en el negocio
   */
  assessBusinessImpact(error, context) {
    const patterns = this.detectErrorPatterns(error, context);
    
    // Impacto alto para errores críticos del negocio
    if (patterns.some(p => p.businessImpact === 'HIGH')) return 'HIGH';
    if (patterns.some(p => p.businessImpact === 'MEDIUM')) return 'MEDIUM';
    
    // Impacto basado en severidad
    const severity = this.calculateSeverity(error, context);
    if (severity >= 4) return 'HIGH';
    if (severity >= 3) return 'MEDIUM';
    
    return 'LOW';
  }

  /**
   * Obtener frecuencia de patrón
   */
  getPatternFrequency(patternType) {
    return this.errorAnalysis.patterns.get(patternType) || 0;
  }

  /**
   * Actualizar análisis de errores
   */
  updateErrorAnalysis(analysis) {
    this.errorAnalysis.totalErrors++;
    
    if (analysis.error.severity >= 4) {
      this.errorAnalysis.criticalErrors++;
    }
    
    // Actualizar patrones
    analysis.patterns.forEach(pattern => {
      const current = this.errorAnalysis.patterns.get(pattern.type) || 0;
      this.errorAnalysis.patterns.set(pattern.type, current + 1);
    });
    
    // Agregar a tendencias
    this.errorAnalysis.trends.push({
      timestamp: analysis.timestamp,
      category: analysis.category,
      severity: analysis.error.severity,
      businessImpact: analysis.businessImpact
    });
  }

  /**
   * Generar reporte diario
   */
  generateDailyReport() {
    const today = new Date().toISOString().split('T')[0];
    const todayErrors = this.errorAnalysis.trends.filter(t => 
      t.timestamp.startsWith(today)
    );
    
    return {
      type: 'DAILY',
      date: today,
      summary: {
        totalErrors: todayErrors.length,
        criticalErrors: todayErrors.filter(e => e.severity >= 4).length,
        categories: this.groupByCategory(todayErrors),
        topPatterns: this.getTopPatterns(1)
      },
      improvements: this.getTopImprovements(5),
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Generar reporte semanal
   */
  generateWeeklyReport() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekErrors = this.errorAnalysis.trends.filter(t => 
      new Date(t.timestamp) >= weekAgo
    );
    
    return {
      type: 'WEEKLY',
      period: '7 días',
      summary: {
        totalErrors: weekErrors.length,
        criticalErrors: weekErrors.filter(e => e.severity >= 4).length,
        trends: this.calculateTrends(weekErrors),
        categories: this.groupByCategory(weekErrors),
        topPatterns: this.getTopPatterns(7)
      },
      improvements: this.getTopImprovements(10),
      recommendations: this.getRecommendations(),
      businessImpact: this.calculateBusinessImpact(weekErrors)
    };
  }

  /**
   * Generar reporte mensual
   */
  generateMonthlyReport() {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const monthErrors = this.errorAnalysis.trends.filter(t => 
      new Date(t.timestamp) >= monthAgo
    );
    
    return {
      type: 'MONTHLY',
      period: '30 días',
      summary: {
        totalErrors: monthErrors.length,
        criticalErrors: monthErrors.filter(e => e.severity >= 4).length,
        trends: this.calculateTrends(monthErrors),
        categories: this.groupByCategory(monthErrors),
        topPatterns: this.getTopPatterns(30)
      },
      improvements: this.getTopImprovements(15),
      recommendations: this.getRecommendations(),
      businessImpact: this.calculateBusinessImpact(monthErrors),
      performance: this.calculatePerformanceMetrics(monthErrors)
    };
  }

  /**
   * Generar reporte en tiempo real
   */
  generateRealtimeReport() {
    return {
      type: 'REALTIME',
      timestamp: new Date().toISOString(),
      currentStatus: {
        totalErrors: this.errorAnalysis.totalErrors,
        criticalErrors: this.errorAnalysis.criticalErrors,
        resolvedErrors: this.errorAnalysis.resolvedErrors,
        resolutionRate: this.errorAnalysis.resolvedErrors / Math.max(this.errorAnalysis.totalErrors, 1) * 100
      },
      activePatterns: Array.from(this.errorAnalysis.patterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      recentErrors: this.errorAnalysis.trends.slice(-10),
      alerts: this.getActiveAlerts()
    };
  }

  /**
   * Agrupar errores por categoría
   */
  groupByCategory(errors) {
    const groups = {};
    errors.forEach(error => {
      groups[error.category] = (groups[error.category] || 0) + 1;
    });
    return groups;
  }

  /**
   * Obtener patrones más frecuentes
   */
  getTopPatterns(days) {
    return Array.from(this.errorAnalysis.patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count, frequency: count / days }));
  }

  /**
   * Obtener mejores mejoras
   */
  getTopImprovements(limit) {
    return this.errorAnalysis.improvements
      .sort((a, b) => b.priority === 'HIGH' ? 1 : -1)
      .slice(0, limit);
  }

  /**
   * Obtener recomendaciones
   */
  getRecommendations() {
    const recommendations = [];

    if (this.errorAnalysis.patterns.get('COMMISSION_PATTERN') > 3) {
      recommendations.push({
        type: 'COMMISSION_OPTIMIZATION',
        description: 'Optimizar sistema de cálculo de comisiones',
        priority: 'HIGH',
        impact: 'Reducir errores de comisión en 95%'
      });
    }

    if (this.errorAnalysis.patterns.get('STREAMER_PATTERN') > 5) {
      recommendations.push({
        type: 'STREAMER_VALIDATION',
        description: 'Mejorar validación de datos de streamers',
        priority: 'HIGH',
        impact: 'Reducir errores de datos en 90%'
      });
    }

    if (this.errorAnalysis.patterns.get('NETWORK_PATTERN') > 3) {
      recommendations.push({
        type: 'NETWORK_RESILIENCE',
        description: 'Implementar estrategias de resiliencia de red',
        priority: 'HIGH',
        impact: 'Reducir fallos de conectividad en 80%'
      });
    }

    return recommendations;
  }

  /**
   * Calcular tendencias
   */
  calculateTrends(errors) {
    const dailyCounts = {};
    errors.forEach(error => {
      const date = error.timestamp.split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    
    const dates = Object.keys(dailyCounts).sort();
    const counts = dates.map(date => dailyCounts[date]);
    
    return {
      dates,
      counts,
      trend: counts.length > 1 ? (counts[counts.length - 1] - counts[0]) / counts.length : 0
    };
  }

  /**
   * Calcular impacto en el negocio
   */
  calculateBusinessImpact(errors) {
    const highImpact = errors.filter(e => e.businessImpact === 'HIGH').length;
    const mediumImpact = errors.filter(e => e.businessImpact === 'MEDIUM').length;
    const lowImpact = errors.filter(e => e.businessImpact === 'LOW').length;
    
    return {
      high: highImpact,
      medium: mediumImpact,
      low: lowImpact,
      total: errors.length,
      highImpactRate: (highImpact / errors.length * 100).toFixed(1) + '%'
    };
  }

  /**
   * Calcular métricas de rendimiento
   */
  calculatePerformanceMetrics(errors) {
    const performanceErrors = errors.filter(e => e.category === 'PERFORMANCE').length;
    const avgSeverity = errors.reduce((sum, e) => sum + e.severity, 0) / errors.length;
    
    return {
      performanceErrors,
      averageSeverity: avgSeverity.toFixed(2),
      performanceErrorRate: (performanceErrors / errors.length * 100).toFixed(1) + '%'
    };
  }

  /**
   * Obtener alertas activas
   */
  getActiveAlerts() {
    const alerts = [];
    
    if (this.errorAnalysis.criticalErrors > 0) {
      alerts.push({
        type: 'CRITICAL',
        message: `${this.errorAnalysis.criticalErrors} errores críticos detectados`,
        action: 'IMMEDIATE_ATTENTION_REQUIRED'
      });
    }
    
    if (this.errorAnalysis.patterns.get('COMMISSION_PATTERN') > 5) {
      alerts.push({
        type: 'BUSINESS',
        message: 'Patrón de errores en cálculo de comisiones detectado',
        action: 'REVIEW_COMMISSION_LOGIC'
      });
    }
    
    return alerts;
  }
}

module.exports = CursorErrorReporter;
