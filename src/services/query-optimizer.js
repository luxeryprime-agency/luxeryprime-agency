/**
 * OPTIMIZADOR DE CONSULTAS CON CURSOR AI
 * Optimización automática de consultas de base de datos
 */

class QueryOptimizer {
  constructor() {
    this.indexes = new Map();
    this.queryCache = new Map();
    this.queryStats = new Map();
    this.cursorAI = {
      learning: true,
      patterns: new Map(),
      optimizations: [],
      predictions: new Map()
    };
    
    this.startIntelligentOptimization();
  }

  /**
   * Optimizar consulta de Firestore
   */
  async optimizeFirestoreQuery(collection, filters = {}, orderBy = [], limit = null) {
    const queryKey = this.generateQueryKey(collection, filters, orderBy, limit);
    
    // Verificar caché de consultas
    if (this.queryCache.has(queryKey)) {
      const cached = this.queryCache.get(queryKey);
      if (!this.isExpired(cached)) {
        this.updateQueryStats(queryKey, 'cache_hit');
        return cached.data;
      }
    }
    
    // Optimizar consulta
    const optimizedQuery = await this.optimizeQuery(collection, filters, orderBy, limit);
    
    // Ejecutar consulta optimizada
    const startTime = Date.now();
    const result = await this.executeOptimizedQuery(optimizedQuery);
    const executionTime = Date.now() - startTime;
    
    // Actualizar estadísticas
    this.updateQueryStats(queryKey, 'execution', executionTime);
    
    // Cachear resultado
    this.cacheQueryResult(queryKey, result);
    
    // Aprender de la consulta
    this.learnFromQuery(collection, filters, orderBy, executionTime);
    
    return result;
  }

  /**
   * Optimizar consulta
   */
  async optimizeQuery(collection, filters, orderBy, limit) {
    const optimizations = [];
    
    // 1. Verificar índices compuestos
    const indexKey = this.generateIndexKey(filters, orderBy);
    if (!this.indexes.has(indexKey)) {
      optimizations.push({
        type: 'create_index',
        collection,
        fields: [...Object.keys(filters), ...orderBy.map(o => o.field)],
        priority: 'high'
      });
    }
    
    // 2. Optimizar filtros
    const optimizedFilters = this.optimizeFilters(filters);
    if (optimizedFilters !== filters) {
      optimizations.push({
        type: 'optimize_filters',
        original: filters,
        optimized: optimizedFilters,
        priority: 'medium'
      });
    }
    
    // 3. Optimizar ordenamiento
    const optimizedOrderBy = this.optimizeOrderBy(orderBy, filters);
    if (optimizedOrderBy !== orderBy) {
      optimizations.push({
        type: 'optimize_orderby',
        original: orderBy,
        optimized: optimizedOrderBy,
        priority: 'medium'
      });
    }
    
    // 4. Aplicar límite inteligente
    const optimizedLimit = this.optimizeLimit(limit, collection);
    if (optimizedLimit !== limit) {
      optimizations.push({
        type: 'optimize_limit',
        original: limit,
        optimized: optimizedLimit,
        priority: 'low'
      });
    }
    
    // Aplicar optimizaciones
    this.applyOptimizations(optimizations);
    
    return {
      collection,
      filters: optimizedFilters,
      orderBy: optimizedOrderBy,
      limit: optimizedLimit,
      optimizations
    };
  }

  /**
   * Optimizar filtros
   */
  optimizeFilters(filters) {
    const optimized = { ...filters };
    
    // Reordenar filtros por selectividad (más selectivos primero)
    const sortedFilters = Object.entries(filters).sort((a, b) => {
      const selectivityA = this.getFieldSelectivity(a[0], a[1]);
      const selectivityB = this.getFieldSelectivity(b[0], b[1]);
      return selectivityB - selectivityA;
    });
    
    // Aplicar filtros más selectivos primero
    const reorderedFilters = {};
    for (const [field, value] of sortedFilters) {
      reorderedFilters[field] = value;
    }
    
    return reorderedFilters;
  }

  /**
   * Optimizar ordenamiento
   */
  optimizeOrderBy(orderBy, filters) {
    if (orderBy.length === 0) return orderBy;
    
    // Si hay filtros, asegurar que el primer campo de ordenamiento esté indexado
    const firstOrderField = orderBy[0].field;
    const hasFilterOnOrderField = filters.hasOwnProperty(firstOrderField);
    
    if (!hasFilterOnOrderField) {
      // Agregar filtro de rango para optimizar
      return orderBy;
    }
    
    return orderBy;
  }

  /**
   * Optimizar límite
   */
  optimizeLimit(limit, collection) {
    if (!limit) return limit;
    
    // Aplicar límite inteligente basado en patrones históricos
    const patterns = this.cursorAI.patterns.get(`${collection}:limit_patterns`) || {};
    const avgResultSize = patterns.avgResultSize || 0;
    
    if (limit > avgResultSize * 2) {
      console.log(`🔍 Cursor AI: Límite optimizado de ${limit} a ${Math.ceil(avgResultSize * 1.5)}`);
      return Math.ceil(avgResultSize * 1.5);
    }
    
    return limit;
  }

  /**
   * Obtener selectividad de campo
   */
  getFieldSelectivity(field, value) {
    // Valores más selectivos tienen mayor puntuación
    if (typeof value === 'string') {
      return value.length > 10 ? 0.9 : 0.5;
    }
    if (typeof value === 'number') {
      return 0.8;
    }
    if (typeof value === 'boolean') {
      return 0.3;
    }
    return 0.5;
  }

  /**
   * Ejecutar consulta optimizada
   */
  async executeOptimizedQuery(query) {
    // Simular ejecución de consulta optimizada
    const mockData = this.generateMockData(query.collection, query.limit);
    
    // Aplicar filtros
    let filteredData = mockData;
    for (const [field, value] of Object.entries(query.filters)) {
      filteredData = filteredData.filter(item => {
        if (typeof value === 'string') {
          return item[field]?.includes(value);
        }
        return item[field] === value;
      });
    }
    
    // Aplicar ordenamiento
    if (query.orderBy.length > 0) {
      filteredData.sort((a, b) => {
        for (const order of query.orderBy) {
          const aVal = a[order.field];
          const bVal = b[order.field];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return order.direction === 'desc' ? -comparison : comparison;
        }
        return 0;
      });
    }
    
    return filteredData;
  }

  /**
   * Generar datos mock para testing
   */
  generateMockData(collection, limit = 100) {
    const data = [];
    const count = Math.min(limit || 100, 1000);
    
    for (let i = 0; i < count; i++) {
      data.push({
        id: `${collection}_${i}`,
        name: `Item ${i}`,
        value: Math.random() * 1000,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.5 ? 'active' : 'inactive'
      });
    }
    
    return data;
  }

  /**
   * Aprender de la consulta
   */
  learnFromQuery(collection, filters, orderBy, executionTime) {
    if (!this.cursorAI.learning) return;
    
    const queryKey = this.generateQueryKey(collection, filters, orderBy);
    const stats = this.queryStats.get(queryKey) || { count: 0, totalTime: 0, avgTime: 0 };
    
    stats.count++;
    stats.totalTime += executionTime;
    stats.avgTime = stats.totalTime / stats.count;
    
    this.queryStats.set(queryKey, stats);
    
    // Detectar consultas lentas
    if (executionTime > 1000) {
      console.log(`🔍 Cursor AI: Consulta lenta detectada (${executionTime}ms): ${collection}`);
      this.suggestQueryOptimization(collection, filters, orderBy, executionTime);
    }
    
    // Actualizar patrones
    this.updateQueryPatterns(collection, filters, orderBy, executionTime);
  }

  /**
   * Sugerir optimización de consulta
   */
  suggestQueryOptimization(collection, filters, orderBy, executionTime) {
    const optimization = {
      collection,
      filters,
      orderBy,
      executionTime,
      timestamp: new Date().toISOString(),
      suggestions: []
    };
    
    // Sugerir índices compuestos
    if (Object.keys(filters).length > 1) {
      optimization.suggestions.push({
        type: 'composite_index',
        fields: Object.keys(filters),
        priority: 'high'
      });
    }
    
    // Sugerir optimización de ordenamiento
    if (orderBy.length > 0) {
      optimization.suggestions.push({
        type: 'orderby_optimization',
        fields: orderBy.map(o => o.field),
        priority: 'medium'
      });
    }
    
    this.cursorAI.optimizations.push(optimization);
    console.log(`💡 Cursor AI: Optimización sugerida para ${collection}:`, optimization.suggestions);
  }

  /**
   * Actualizar patrones de consulta
   */
  updateQueryPatterns(collection, filters, orderBy, executionTime) {
    const patternKey = `${collection}:patterns`;
    const patterns = this.cursorAI.patterns.get(patternKey) || {
      totalQueries: 0,
      avgExecutionTime: 0,
      commonFilters: new Map(),
      commonOrderBy: new Map()
    };
    
    patterns.totalQueries++;
    patterns.avgExecutionTime = (patterns.avgExecutionTime + executionTime) / 2;
    
    // Rastrear filtros comunes
    for (const field of Object.keys(filters)) {
      const count = patterns.commonFilters.get(field) || 0;
      patterns.commonFilters.set(field, count + 1);
    }
    
    // Rastrear ordenamientos comunes
    for (const order of orderBy) {
      const key = `${order.field}:${order.direction}`;
      const count = patterns.commonOrderBy.get(key) || 0;
      patterns.commonOrderBy.set(key, count + 1);
    }
    
    this.cursorAI.patterns.set(patternKey, patterns);
  }

  /**
   * Aplicar optimizaciones
   */
  applyOptimizations(optimizations) {
    for (const optimization of optimizations) {
      switch (optimization.type) {
        case 'create_index':
          this.createCompositeIndex(optimization.collection, optimization.fields);
          break;
        case 'optimize_filters':
          console.log(`⚡ Cursor AI: Filtros optimizados para ${optimization.collection}`);
          break;
        case 'optimize_orderby':
          console.log(`⚡ Cursor AI: Ordenamiento optimizado para ${optimization.collection}`);
          break;
        case 'optimize_limit':
          console.log(`⚡ Cursor AI: Límite optimizado para ${optimization.collection}`);
          break;
      }
    }
  }

  /**
   * Crear índice compuesto
   */
  createCompositeIndex(collection, fields) {
    const indexKey = fields.join(':');
    this.indexes.set(indexKey, {
      collection,
      fields,
      createdAt: new Date().toISOString(),
      usageCount: 0
    });
    
    console.log(`📊 Cursor AI: Índice compuesto creado para ${collection}: [${fields.join(', ')}]`);
  }

  /**
   * Iniciar optimización inteligente
   */
  startIntelligentOptimization() {
    // Optimización cada 10 minutos
    setInterval(() => {
      this.performIntelligentOptimization();
    }, 10 * 60 * 1000);
    
    console.log('🤖 Cursor AI: Optimizador de consultas iniciado');
  }

  /**
   * Realizar optimización inteligente
   */
  performIntelligentOptimization() {
    console.log('🔍 Cursor AI: Analizando patrones de consultas...');
    
    // Analizar consultas lentas
    const slowQueries = Array.from(this.queryStats.entries())
      .filter(([key, stats]) => stats.avgTime > 500)
      .sort((a, b) => b[1].avgTime - a[1].avgTime);
    
    if (slowQueries.length > 0) {
      console.log(`🔍 Cursor AI: ${slowQueries.length} consultas lentas detectadas`);
      this.optimizeSlowQueries(slowQueries);
    }
    
    // Analizar patrones de uso
    this.analyzeUsagePatterns();
  }

  /**
   * Optimizar consultas lentas
   */
  optimizeSlowQueries(slowQueries) {
    for (const [queryKey, stats] of slowQueries.slice(0, 5)) { // Top 5 más lentas
      console.log(`⚡ Cursor AI: Optimizando consulta lenta: ${queryKey} (${stats.avgTime.toFixed(0)}ms)`);
      
      // Aquí se aplicarían optimizaciones específicas
      // Por ahora, solo logueamos la optimización
    }
  }

  /**
   * Analizar patrones de uso
   */
  analyzeUsagePatterns() {
    for (const [patternKey, patterns] of this.cursorAI.patterns.entries()) {
      if (patternKey.includes(':patterns')) {
        const collection = patternKey.split(':')[0];
        console.log(`📊 Cursor AI: Patrones para ${collection}:`, {
          totalQueries: patterns.totalQueries,
          avgExecutionTime: patterns.avgExecutionTime.toFixed(0) + 'ms',
          commonFilters: Array.from(patterns.commonFilters.entries()).slice(0, 3),
          commonOrderBy: Array.from(patterns.commonOrderBy.entries()).slice(0, 3)
        });
      }
    }
  }

  /**
   * Generar clave de consulta
   */
  generateQueryKey(collection, filters, orderBy, limit) {
    const filtersStr = JSON.stringify(filters);
    const orderByStr = JSON.stringify(orderBy);
    return `${collection}:${filtersStr}:${orderByStr}:${limit}`;
  }

  /**
   * Generar clave de índice
   */
  generateIndexKey(filters, orderBy) {
    const fields = [...Object.keys(filters), ...orderBy.map(o => o.field)];
    return fields.sort().join(':');
  }

  /**
   * Verificar si el caché ha expirado
   */
  isExpired(cached) {
    const now = Date.now();
    return (now - cached.timestamp) > 300000; // 5 minutos
  }

  /**
   * Cachear resultado de consulta
   */
  cacheQueryResult(queryKey, result) {
    this.queryCache.set(queryKey, {
      data: result,
      timestamp: Date.now()
    });
  }

  /**
   * Actualizar estadísticas de consulta
   */
  updateQueryStats(queryKey, type, executionTime = 0) {
    const stats = this.queryStats.get(queryKey) || { count: 0, totalTime: 0, avgTime: 0, cacheHits: 0 };
    
    if (type === 'cache_hit') {
      stats.cacheHits++;
    } else if (type === 'execution') {
      stats.count++;
      stats.totalTime += executionTime;
      stats.avgTime = stats.totalTime / stats.count;
    }
    
    this.queryStats.set(queryKey, stats);
  }

  /**
   * Obtener métricas del optimizador
   */
  getMetrics() {
    return {
      indexes: this.indexes.size,
      queryCache: this.queryCache.size,
      queryStats: this.queryStats.size,
      cursorAI: {
        learning: this.cursorAI.learning,
        patterns: this.cursorAI.patterns.size,
        optimizations: this.cursorAI.optimizations.length
      }
    };
  }

  /**
   * Obtener estadísticas detalladas
   */
  getDetailedStats() {
    const stats = {
      indexes: Array.from(this.indexes.values()),
      queryCache: this.queryCache.size,
      queryStats: Object.fromEntries(this.queryStats),
      patterns: Object.fromEntries(this.cursorAI.patterns),
      optimizations: this.cursorAI.optimizations
    };
    
    return stats;
  }
}

// Instancia global
const queryOptimizer = new QueryOptimizer();

module.exports = { QueryOptimizer, queryOptimizer };
