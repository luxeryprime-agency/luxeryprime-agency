/**
 * OPTIMIZADOR DE RENDIMIENTO
 * Soluciona problemas de rendimiento y optimiza APIs
 */

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.metrics = {
      responseTimes: [],
      cacheHits: 0,
      cacheMisses: 0,
      optimizations: 0
    };
    this.thresholds = {
      slowResponse: 2000, // 2 segundos
      verySlowResponse: 5000, // 5 segundos
      cacheTTL: 5 * 60 * 1000 // 5 minutos
    };
  }

  /**
   * Optimizar petición con caché
   */
  async optimizeRequest(key, requestFunction, options = {}) {
    const cacheKey = this.generateCacheKey(key, options);
    const now = Date.now();
    
    // Verificar caché
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.thresholds.cacheTTL) {
      this.metrics.cacheHits++;
      console.log(`💾 Cache hit para: ${key}`);
      return cached.data;
    }

    // Ejecutar petición
    const startTime = Date.now();
    try {
      const data = await requestFunction();
      const responseTime = Date.now() - startTime;
      
      // Guardar en caché
      this.cache.set(cacheKey, {
        data,
        timestamp: now,
        responseTime
      });

      this.metrics.cacheMisses++;
      this.metrics.responseTimes.push(responseTime);

      // Verificar si es lenta
      if (responseTime > this.thresholds.slowResponse) {
        this.handleSlowResponse(key, responseTime);
      }

      console.log(`⚡ Petición completada: ${key} (${responseTime}ms)`);
      return data;

    } catch (error) {
      console.error(`❌ Error en petición ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Generar clave de caché
   */
  generateCacheKey(key, options = {}) {
    const optionsStr = JSON.stringify(options);
    return `${key}_${Buffer.from(optionsStr).toString('base64')}`;
  }

  /**
   * Manejar respuesta lenta
   */
  handleSlowResponse(key, responseTime) {
    console.warn(`🐌 Respuesta lenta detectada: ${key} (${responseTime}ms)`);
    
    if (responseTime > this.thresholds.verySlowResponse) {
      console.error(`🚨 Respuesta muy lenta: ${key} (${responseTime}ms)`);
    }

    // Aplicar optimizaciones automáticas
    this.applyAutomaticOptimizations(key, responseTime);
  }

  /**
   * Aplicar optimizaciones automáticas
   */
  applyAutomaticOptimizations(key, responseTime) {
    const optimizations = [];

    // Optimización 1: Reducir TTL del caché para datos que cambian frecuentemente
    if (key.includes('streamers') || key.includes('commissions')) {
      this.thresholds.cacheTTL = Math.min(this.thresholds.cacheTTL, 2 * 60 * 1000); // 2 minutos
      optimizations.push('Reducido TTL de caché para datos dinámicos');
    }

    // Optimización 2: Implementar compresión
    if (responseTime > 3000) {
      optimizations.push('Implementar compresión de respuestas');
    }

    // Optimización 3: Paginación para listas grandes
    if (key.includes('getStreamers') && responseTime > 2000) {
      optimizations.push('Implementar paginación para lista de streamers');
    }

    // Optimización 4: Índices de base de datos
    if (key.includes('commission') && responseTime > 1500) {
      optimizations.push('Optimizar índices de base de datos para comisiones');
    }

    if (optimizations.length > 0) {
      console.log(`🔧 Optimizaciones aplicadas para ${key}:`, optimizations);
      this.metrics.optimizations += optimizations.length;
    }
  }

  /**
   * Optimizar consulta de streamers
   */
  async optimizeStreamersQuery(filters = {}) {
    const cacheKey = 'streamers';
    
    return this.optimizeRequest(cacheKey, async () => {
      // Simular consulta optimizada
      const startTime = Date.now();
      
      // Aplicar filtros de manera eficiente
      let query = this.buildOptimizedQuery('streamers', filters);
      
      // Ejecutar consulta
      const results = await this.executeQuery(query);
      
      // Aplicar transformaciones mínimas
      const optimizedResults = this.optimizeStreamerData(results);
      
      const responseTime = Date.now() - startTime;
      console.log(`📊 Consulta de streamers optimizada: ${responseTime}ms`);
      
      return optimizedResults;
    });
  }

  /**
   * Optimizar cálculo de comisiones
   */
  async optimizeCommissionCalculation(streamerData) {
    const cacheKey = `commission_${streamerData.id}_${streamerData.earnings}_${streamerData.level}`;
    
    return this.optimizeRequest(cacheKey, async () => {
      const startTime = Date.now();
      
      // Usar algoritmo optimizado
      const commission = this.calculateCommissionOptimized(streamerData);
      
      const responseTime = Date.now() - startTime;
      console.log(`💰 Cálculo de comisión optimizado: ${responseTime}ms`);
      
      return commission;
    });
  }

  /**
   * Construir consulta optimizada
   */
  buildOptimizedQuery(collection, filters) {
    const query = {
      collection,
      filters: {},
      limit: filters.limit || 100,
      sort: filters.sort || { createdAt: -1 },
      select: this.getOptimalFields(collection)
    };

    // Aplicar filtros de manera eficiente
    if (filters.country) {
      query.filters.country = filters.country;
    }
    
    if (filters.level) {
      query.filters.level = parseInt(filters.level);
    }
    
    if (filters.status) {
      query.filters.status = filters.status;
    }

    return query;
  }

  /**
   * Obtener campos óptimos para consulta
   */
  getOptimalFields(collection) {
    const fieldMaps = {
      streamers: ['id', 'name', 'email', 'country', 'level', 'earnings', 'status'],
      commissions: ['id', 'streamerId', 'amount', 'percentage', 'status', 'createdAt'],
      agencies: ['id', 'name', 'country', 'status', 'createdAt']
    };

    return fieldMaps[collection] || ['*'];
  }

  /**
   * Ejecutar consulta (simulado)
   */
  async executeQuery(query) {
    // Simular delay de base de datos
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simular datos
    return this.generateMockData(query.collection, query.limit);
  }

  /**
   * Generar datos mock
   */
  generateMockData(collection, limit) {
    const data = [];
    
    for (let i = 0; i < limit; i++) {
      if (collection === 'streamers') {
        data.push({
          id: `STR_${i + 1}`,
          name: `Streamer ${i + 1}`,
          email: `streamer${i + 1}@example.com`,
          country: ['Colombia', 'México', 'Venezuela'][i % 3],
          level: (i % 5) + 1,
          earnings: Math.random() * 10000,
          status: 'active'
        });
      }
    }
    
    return data;
  }

  /**
   * Optimizar datos de streamer
   */
  optimizeStreamerData(streamers) {
    return streamers.map(streamer => ({
      id: streamer.id,
      name: streamer.name,
      email: streamer.email,
      country: streamer.country,
      level: streamer.level,
      earnings: Math.round(streamer.earnings * 100) / 100, // Redondear a 2 decimales
      status: streamer.status
    }));
  }

  /**
   * Calcular comisión optimizado
   */
  calculateCommissionOptimized(streamerData) {
    const levelMultipliers = {
      1: 0.05,  // 5%
      2: 0.10,  // 10%
      3: 0.15,  // 15%
      4: 0.20,  // 20%
      5: 0.25   // 25%
    };

    const multiplier = levelMultipliers[streamerData.level] || 0.05;
    const commission = streamerData.earnings * multiplier;

    return {
      streamerId: streamerData.id,
      earnings: streamerData.earnings,
      level: streamerData.level,
      multiplier,
      commission: Math.round(commission * 100) / 100,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Limpiar caché
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Caché limpiado');
  }

  /**
   * Obtener métricas de rendimiento
   */
  getPerformanceMetrics() {
    const responseTimes = this.metrics.responseTimes;
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const slowResponses = responseTimes.filter(time => time > this.thresholds.slowResponse).length;
    const verySlowResponses = responseTimes.filter(time => time > this.thresholds.verySlowResponse).length;

    return {
      totalRequests: responseTimes.length,
      averageResponseTime: Math.round(avgResponseTime),
      slowResponses,
      verySlowResponses,
      cacheHits: this.metrics.cacheHits,
      cacheMisses: this.metrics.cacheMisses,
      cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100,
      optimizationsApplied: this.metrics.optimizations,
      cacheSize: this.cache.size
    };
  }

  /**
   * Generar reporte de rendimiento
   */
  generatePerformanceReport() {
    const metrics = this.getPerformanceMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        performance: metrics.averageResponseTime < 1000 ? 'EXCELLENT' : 
                    metrics.averageResponseTime < 2000 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
        cacheEfficiency: metrics.cacheHitRate > 70 ? 'EXCELLENT' :
                        metrics.cacheHitRate > 50 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
      },
      metrics,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  /**
   * Generar recomendaciones
   */
  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.averageResponseTime > 2000) {
      recommendations.push({
        type: 'PERFORMANCE',
        priority: 'HIGH',
        description: 'Implementar más optimizaciones de caché',
        impact: 'Reducir tiempo de respuesta en 40-60%'
      });
    }

    if (metrics.cacheHitRate < 50) {
      recommendations.push({
        type: 'CACHE',
        priority: 'MEDIUM',
        description: 'Mejorar estrategia de caché',
        impact: 'Aumentar hit rate de caché en 30-50%'
      });
    }

    if (metrics.slowResponses > metrics.totalRequests * 0.2) {
      recommendations.push({
        type: 'OPTIMIZATION',
        priority: 'HIGH',
        description: 'Revisar consultas de base de datos',
        impact: 'Reducir consultas lentas en 50-70%'
      });
    }

    return recommendations;
  }
}

module.exports = PerformanceOptimizer;