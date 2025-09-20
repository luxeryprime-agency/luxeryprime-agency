/**
 * CACHÉ INTELIGENTE CON CURSOR AI SUPERVISOR
 * Optimización de rendimiento con aprendizaje automático
 */

class IntelligentCache {
  constructor() {
    this.cache = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
    
    this.strategies = {
      'streamers': { 
        ttl: 300, // 5 minutos
        priority: 'high',
        maxSize: 1000,
        strategy: 'write-through'
      },
      'commissions': { 
        ttl: 600, // 10 minutos
        priority: 'medium',
        maxSize: 500,
        strategy: 'write-behind'
      },
      'agencies': { 
        ttl: 1800, // 30 minutos
        priority: 'low',
        maxSize: 100,
        strategy: 'read-through'
      }
    };
    
    this.cursorAI = {
      learning: true,
      patterns: new Map(),
      predictions: new Map(),
      optimizations: []
    };
    
    this.startIntelligentOptimization();
  }

  /**
   * Obtener datos con caché inteligente
   */
  async get(key, fetcher, category = 'default') {
    this.metrics.totalRequests++;
    
    // Verificar caché
    const cached = this.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      this.metrics.hits++;
      this.updateCursorAIPatterns(key, 'hit', category);
      return cached.data;
    }
    
    // Cache miss - obtener datos
    this.metrics.misses++;
    this.updateCursorAIPatterns(key, 'miss', category);
    
    try {
      const data = await fetcher();
      this.set(key, data, category);
      return data;
    } catch (error) {
      console.error('Error en fetcher:', error);
      throw error;
    }
  }

  /**
   * Establecer datos en caché
   */
  set(key, data, category = 'default') {
    const strategy = this.strategies[category] || this.strategies['streamers'];
    const now = Date.now();
    
    const cacheEntry = {
      data,
      timestamp: now,
      ttl: strategy.ttl * 1000,
      category,
      priority: strategy.priority,
      accessCount: 0,
      lastAccess: now
    };
    
    // Verificar límite de tamaño
    if (this.cache.size >= strategy.maxSize) {
      this.evictLeastUsed(category);
    }
    
    this.cache.set(key, cacheEntry);
    this.updateCursorAIPatterns(key, 'set', category);
  }

  /**
   * Verificar si el caché ha expirado
   */
  isExpired(entry) {
    const now = Date.now();
    return (now - entry.timestamp) > entry.ttl;
  }

  /**
   * Evictar entradas menos usadas
   */
  evictLeastUsed(category) {
    const entries = Array.from(this.cache.entries())
      .filter(([key, entry]) => entry.category === category)
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    
    if (entries.length > 0) {
      const [keyToEvict] = entries[0];
      this.cache.delete(keyToEvict);
      this.metrics.evictions++;
      console.log(`🗑️ Evicted: ${keyToEvict} (${category})`);
    }
  }

  /**
   * Actualizar patrones para Cursor AI
   */
  updateCursorAIPatterns(key, action, category) {
    if (!this.cursorAI.learning) return;
    
    const patternKey = `${category}:${action}`;
    const current = this.cursorAI.patterns.get(patternKey) || 0;
    this.cursorAI.patterns.set(patternKey, current + 1);
    
    // Detectar patrones de uso
    this.detectUsagePatterns(key, category);
  }

  /**
   * Detectar patrones de uso para optimización
   */
  detectUsagePatterns(key, category) {
    const hitRate = this.metrics.hits / this.metrics.totalRequests;
    
    if (hitRate < 0.7) {
      console.log(`🔍 Cursor AI: Bajo hit rate detectado para ${category} (${(hitRate * 100).toFixed(1)}%)`);
      this.suggestOptimization(category, 'increase_ttl');
    }
    
    if (this.metrics.evictions > this.metrics.hits * 0.1) {
      console.log(`🔍 Cursor AI: Muchas evicciones detectadas para ${category}`);
      this.suggestOptimization(category, 'increase_size');
    }
  }

  /**
   * Sugerir optimizaciones automáticas
   */
  suggestOptimization(category, type) {
    const optimization = {
      category,
      type,
      timestamp: new Date().toISOString(),
      applied: false
    };
    
    this.cursorAI.optimizations.push(optimization);
    
    // Aplicar optimización automáticamente si es segura
    if (this.isSafeOptimization(optimization)) {
      this.applyOptimization(optimization);
    }
  }

  /**
   * Verificar si la optimización es segura
   */
  isSafeOptimization(optimization) {
    // Solo aplicar optimizaciones de TTL y tamaño
    return ['increase_ttl', 'increase_size'].includes(optimization.type);
  }

  /**
   * Aplicar optimización automática
   */
  applyOptimization(optimization) {
    const strategy = this.strategies[optimization.category];
    
    switch (optimization.type) {
      case 'increase_ttl':
        strategy.ttl = Math.min(strategy.ttl * 1.5, 3600); // Max 1 hora
        console.log(`⚡ Cursor AI: TTL aumentado para ${optimization.category} a ${strategy.ttl}s`);
        break;
        
      case 'increase_size':
        strategy.maxSize = Math.min(strategy.maxSize * 1.5, 5000); // Max 5000
        console.log(`⚡ Cursor AI: Tamaño aumentado para ${optimization.category} a ${strategy.maxSize}`);
        break;
    }
    
    optimization.applied = true;
    optimization.appliedAt = new Date().toISOString();
  }

  /**
   * Iniciar optimización inteligente
   */
  startIntelligentOptimization() {
    // Optimización cada 5 minutos
    setInterval(() => {
      this.performIntelligentOptimization();
    }, 5 * 60 * 1000);
    
    console.log('🤖 Cursor AI: Caché inteligente iniciado');
  }

  /**
   * Realizar optimización inteligente
   */
  performIntelligentOptimization() {
    const hitRate = this.metrics.hits / this.metrics.totalRequests;
    
    console.log(`🔍 Cursor AI: Analizando caché - Hit rate: ${(hitRate * 100).toFixed(1)}%`);
    
    // Optimizar estrategias basado en patrones
    for (const [category, strategy] of Object.entries(this.strategies)) {
      const categoryHits = this.cursorAI.patterns.get(`${category}:hit`) || 0;
      const categoryMisses = this.cursorAI.patterns.get(`${category}:miss`) || 0;
      const categoryHitRate = categoryHits / (categoryHits + categoryMisses) || 0;
      
      if (categoryHitRate < 0.6) {
        this.suggestOptimization(category, 'increase_ttl');
      }
    }
  }

  /**
   * Obtener métricas del caché
   */
  getMetrics() {
    const hitRate = this.metrics.hits / this.metrics.totalRequests;
    
    return {
      ...this.metrics,
      hitRate: hitRate * 100,
      cacheSize: this.cache.size,
      strategies: this.strategies,
      cursorAI: {
        learning: this.cursorAI.learning,
        patterns: Object.fromEntries(this.cursorAI.patterns),
        optimizations: this.cursorAI.optimizations.filter(o => o.applied)
      }
    };
  }

  /**
   * Limpiar caché
   */
  clear() {
    this.cache.clear();
    this.metrics = { hits: 0, misses: 0, evictions: 0, totalRequests: 0 };
    console.log('🗑️ Caché limpiado');
  }

  /**
   * Obtener estadísticas detalladas
   */
  getDetailedStats() {
    const stats = {
      total: this.metrics.totalRequests,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      evictions: this.metrics.evictions,
      hitRate: (this.metrics.hits / this.metrics.totalRequests * 100).toFixed(2) + '%',
      cacheSize: this.cache.size,
      categories: {}
    };
    
    // Estadísticas por categoría
    for (const [category, strategy] of Object.entries(this.strategies)) {
      const hits = this.cursorAI.patterns.get(`${category}:hit`) || 0;
      const misses = this.cursorAI.patterns.get(`${category}:miss`) || 0;
      const total = hits + misses;
      
      stats.categories[category] = {
        hits,
        misses,
        total,
        hitRate: total > 0 ? (hits / total * 100).toFixed(2) + '%' : '0%',
        ttl: strategy.ttl,
        maxSize: strategy.maxSize,
        priority: strategy.priority
      };
    }
    
    return stats;
  }
}

// Instancia global
const intelligentCache = new IntelligentCache();

module.exports = { IntelligentCache, intelligentCache };
