/**
 * SISTEMA DE RESILIENCIA DE RED
 * Soluciona errores de conectividad y timeouts
 */

class NetworkResilience {
  constructor() {
    this.config = {
      maxRetries: 3,
      baseDelay: 1000, // 1 segundo
      maxDelay: 10000, // 10 segundos
      timeout: 30000, // 30 segundos
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000 // 1 minuto
    };
    
    this.circuitBreaker = {
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failureCount: 0,
      lastFailureTime: null
    };
    
    this.retryStrategies = {
      exponential: this.exponentialBackoff.bind(this),
      linear: this.linearBackoff.bind(this),
      fixed: this.fixedDelay.bind(this)
    };
  }

  /**
   * Ejecutar con reintentos automáticos
   */
  async executeWithRetry(operation, options = {}) {
    const config = { ...this.config, ...options };
    let lastError;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        // Verificar circuit breaker
        if (this.circuitBreaker.state === 'OPEN') {
          if (Date.now() - this.circuitBreaker.lastFailureTime > config.circuitBreakerTimeout) {
            this.circuitBreaker.state = 'HALF_OPEN';
            console.log('🔄 Circuit breaker: Cambiando a HALF_OPEN');
          } else {
            throw new Error('Circuit breaker está ABIERTO - Servicio temporalmente no disponible');
          }
        }

        // Ejecutar operación con timeout
        const result = await this.executeWithTimeout(operation, config.timeout);
        
        // Éxito - resetear circuit breaker
        this.resetCircuitBreaker();
        return result;

      } catch (error) {
        lastError = error;
        console.error(`❌ Intento ${attempt}/${config.maxRetries} falló:`, error.message);

        // Actualizar circuit breaker
        this.updateCircuitBreaker();

        // Si no es el último intento, esperar antes del siguiente
        if (attempt < config.maxRetries) {
          const delay = this.calculateDelay(attempt, config);
          console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
          await this.sleep(delay);
        }
      }
    }

    // Todos los intentos fallaron
    throw new Error(`Operación falló después de ${config.maxRetries} intentos. Último error: ${lastError.message}`);
  }

  /**
   * Ejecutar con timeout
   */
  async executeWithTimeout(operation, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operación timeout después de ${timeout}ms`));
      }, timeout);

      operation()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Calcular delay para reintento
   */
  calculateDelay(attempt, config) {
    const strategy = config.retryStrategy || 'exponential';
    return this.retryStrategies[strategy](attempt, config);
  }

  /**
   * Backoff exponencial
   */
  exponentialBackoff(attempt, config) {
    const delay = Math.min(
      config.baseDelay * Math.pow(2, attempt - 1),
      config.maxDelay
    );
    return delay + Math.random() * 1000; // Jitter
  }

  /**
   * Backoff lineal
   */
  linearBackoff(attempt, config) {
    return Math.min(
      config.baseDelay * attempt,
      config.maxDelay
    );
  }

  /**
   * Delay fijo
   */
  fixedDelay(attempt, config) {
    return config.baseDelay;
  }

  /**
   * Actualizar circuit breaker
   */
  updateCircuitBreaker() {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failureCount >= this.config.circuitBreakerThreshold) {
      this.circuitBreaker.state = 'OPEN';
      console.log('⚡ Circuit breaker: ABIERTO - Rechazando solicitudes');
    }
  }

  /**
   * Resetear circuit breaker
   */
  resetCircuitBreaker() {
    this.circuitBreaker.state = 'CLOSED';
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.lastFailureTime = null;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Hacer petición HTTP con resiliencia
   */
  async fetchWithResilience(url, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LuxeryPrime-Agency/1.0'
      },
      timeout: this.config.timeout
    };

    const finalOptions = { ...defaultOptions, ...options };

    return this.executeWithRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const response = await fetch(url, {
          ...finalOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    });
  }

  /**
   * Obtener estado del circuit breaker
   */
  getCircuitBreakerStatus() {
    return {
      state: this.circuitBreaker.state,
      failureCount: this.circuitBreaker.failureCount,
      lastFailureTime: this.circuitBreaker.lastFailureTime,
      isOpen: this.circuitBreaker.state === 'OPEN'
    };
  }

  /**
   * Forzar cierre del circuit breaker (para testing)
   */
  forceCloseCircuitBreaker() {
    this.resetCircuitBreaker();
    console.log('🔧 Circuit breaker forzado a CERRADO');
  }
}

module.exports = NetworkResilience;