import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// CONFIGURACIÓN MEJORADA CON CURSOR AI
// ============================================================================

const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxOkgC_boHTVaAFAQQucJ-mXqRoeKMiPwN0W73wxSwLBU6xoi2-vWoc6KAGknS94HmR/exec';

// Configuración de retry y timeout optimizada
const API_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 10000,
  CACHE_TTL: 300000, // 5 minutos
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000 // 1 minuto
  }
};

// Sistema de métricas en tiempo real
const METRICS = {
  requests: 0,
  errors: 0,
  cacheHits: 0,
  averageResponseTime: 0,
  lastReset: Date.now()
};

// === SERVICIOS DE CORRECCIÓN DE ERRORES INTEGRADOS ===

// Validador de Comisiones Mejorado con Cursor AI
class CommissionValidator {
  private validLevels = [1, 2, 3, 4, 5];
  private levelMultipliers = {
    1: 0.05, 2: 0.10, 3: 0.15, 4: 0.20, 5: 0.25
  };
  
  // Cache para validaciones repetitivas
  private validationCache = new Map<string, any>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutos

  /**
   * Valida datos de streamer con cache inteligente
   * @param streamerData - Datos del streamer
   * @returns Resultado de validación
   */
  validateStreamerData(streamerData: any) {
    const cacheKey = `validation_${streamerData.id}_${streamerData.earnings}`;
    const cached = this.validationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.result;
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validación de ID optimizada
    if (!this.isValidId(streamerData.id)) {
      errors.push('ID de streamer es requerido y debe ser string válido');
    }

    // Validación de nivel con corrección automática
    let level = this.validateAndCorrectLevel(streamerData.level, streamerData.earnings);
    if (level !== streamerData.level) {
      warnings.push(`Nivel corregido: ${streamerData.level} → ${level}`);
      streamerData.level = level;
    }

    // Validación de earnings optimizada
    const earningsValidation = this.validateEarnings(streamerData.earnings);
    if (!earningsValidation.isValid) {
      errors.push(...earningsValidation.errors);
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedData: { ...streamerData, level }
    };

    // Cachear resultado
    this.validationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Valida ID de streamer
   * @param id - ID a validar
   * @returns true si es válido
   */
  private isValidId(id: any): boolean {
    return typeof id === 'string' && id.trim().length > 0 && /^[a-zA-Z0-9_-]+$/.test(id);
  }

  /**
   * Valida y corrige nivel basado en earnings
   * @param level - Nivel actual
   * @param earnings - Ganancias
   * @returns Nivel corregido
   */
  private validateAndCorrectLevel(level: any, earnings: number): number {
    if (level && this.validLevels.includes(level)) {
      return level;
    }
    return this.suggestLevelByEarnings(earnings);
  }

  /**
   * Valida earnings con reglas mejoradas
   * @param earnings - Ganancias a validar
   * @returns Resultado de validación
   */
  private validateEarnings(earnings: any) {
    const errors: string[] = [];
    
    if (typeof earnings !== 'number' || isNaN(earnings)) {
      errors.push('Earnings debe ser un número válido');
    } else if (earnings < 0) {
      errors.push('Earnings debe ser un número positivo');
    } else if (earnings > 1000000) {
      errors.push('Earnings excede el límite máximo permitido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sugiere nivel basado en earnings con lógica mejorada
   * @param earnings - Ganancias
   * @returns Nivel sugerido
   */
  private suggestLevelByEarnings(earnings: number): number {
    if (earnings >= 10000) return 5;
    if (earnings >= 5000) return 4;
    if (earnings >= 2000) return 3;
    if (earnings >= 500) return 2;
    return 1;
  }

  /**
   * Calcula comisión con optimizaciones
   * @param streamerData - Datos del streamer
   * @returns Resultado del cálculo
   */
  calculateCommission(streamerData: any) {
    try {
      const validation = this.validateStreamerData(streamerData);
      
      if (!validation.isValid) {
        return this.createErrorResponse(validation.errors);
      }

      const data = validation.correctedData;
      const multiplier = this.levelMultipliers[data.level as keyof typeof this.levelMultipliers];
      const commission = this.calculateCommissionAmount(data.earnings, multiplier);
      
      return this.createSuccessResponse({
        commission,
        level: data.level,
        multiplier,
        baseEarnings: data.earnings,
        warnings: validation.warnings
      });

    } catch (error: any) {
      return this.createErrorResponse([error.message]);
    }
  }

  /**
   * Calcula monto de comisión con precisión
   * @param earnings - Ganancias base
   * @param multiplier - Multiplicador
   * @returns Comisión calculada
   */
  private calculateCommissionAmount(earnings: number, multiplier: number): number {
    return Math.round(earnings * multiplier * 100) / 100;
  }

  /**
   * Crea respuesta de éxito estandarizada
   * @param data - Datos de respuesta
   * @returns Respuesta de éxito
   */
  private createSuccessResponse(data: any) {
    return {
      success: true,
      ...data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Crea respuesta de error estandarizada
   * @param errors - Array de errores
   * @returns Respuesta de error
   */
  private createErrorResponse(errors: string[]) {
    return {
      success: false,
      error: errors.join(', '),
      errors,
      commission: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Limpia cache expirado
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.validationCache.entries()) {
      if (now - value.timestamp > this.cacheExpiry) {
        this.validationCache.delete(key);
      }
    }
  }
}

// Validador de Streamers Mejorado
class StreamerValidator {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private validCountries = ['Colombia', 'México', 'Venezuela', 'Perú', 'Ecuador', 'Chile', 'Argentina'];

  validateEmail(email: string) {
    if (!email) return { isValid: false, error: 'Email es requerido' };
    
    const cleaned = email.toLowerCase().trim();
    
    if (!this.emailRegex.test(cleaned)) {
      const corrected = this.attemptEmailCorrection(cleaned);
      return {
        isValid: corrected ? true : false,
        corrected,
        original: email
      };
    }
    
    return { isValid: true, corrected: cleaned };
  }

  private attemptEmailCorrection(email: string) {
    const corrections: { [key: string]: string[] } = {
      'gmail.com': ['gmial.com', 'gmail.co', 'gmail.coom'],
      'hotmail.com': ['hotmial.com', 'hotmail.co', 'hotmail.coom'],
      'yahoo.com': ['yaho.com', 'yahoo.co', 'yahoo.coom']
    };

    for (const [correct, typos] of Object.entries(corrections)) {
      for (const typo of typos) {
        if (email.includes(typo)) {
          return email.replace(typo, correct);
        }
      }
    }
    return null;
  }

  validateStreamer(streamerData: any) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const correctedData = { ...streamerData };

    // Validar email
    const emailValidation = this.validateEmail(streamerData.email);
    if (!emailValidation.isValid) {
      if (emailValidation.corrected) {
        correctedData.email = emailValidation.corrected;
        warnings.push(`Email corregido: ${streamerData.email} → ${emailValidation.corrected}`);
      } else {
        errors.push(emailValidation.error);
      }
    } else {
      correctedData.email = emailValidation.corrected;
    }

    // Validar país
    if (!streamerData.country) {
      correctedData.country = 'Colombia';
      warnings.push('País no especificado, usando Colombia por defecto');
    } else {
      const country = streamerData.country.trim();
      if (!this.validCountries.includes(country)) {
        const similar = this.findSimilarCountry(country);
        if (similar) {
          correctedData.country = similar;
          warnings.push(`País corregido: ${country} → ${similar}`);
        } else {
          errors.push(`País no válido: ${country}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedData
    };
  }

  private findSimilarCountry(input: string) {
    const inputLower = input.toLowerCase();
    for (const country of this.validCountries) {
      if (country.toLowerCase().includes(inputLower) || inputLower.includes(country.toLowerCase())) {
        return country;
      }
    }
    return null;
  }
}

// Instancias globales
const commissionValidator = new CommissionValidator();
const streamerValidator = new StreamerValidator();

// === SERVICIOS DE OPTIMIZACIÓN INTEGRADOS ===
const { intelligentCache } = require('../../services/intelligent-cache');
const { queryOptimizer } = require('../../services/query-optimizer');
const { networkOptimizer } = require('../../services/network-optimizer');

// === SISTEMA DE LOGGING DINÁMICO PARA FRONTEND ===
class FrontendLogger {
  private logs: any[] = [];
  private analytics = {
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    apiCount: 0,
    performance: {
      totalResponseTime: 0,
      requestCount: 0
    }
  };

  log(level: string, message: string, context: any = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      id: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.logs.push(logEntry);
    this.updateAnalytics(level);
    
    // Log en consola del servidor
    console.log(`[${level}] ${message}`, context);
  }

  info(message: string, context: any = {}) {
    this.log('INFO', message, context);
    this.analytics.infoCount++;
  }

  error(message: string, error: any = null, context: any = {}) {
    this.log('ERROR', message, { ...context, error: error?.message });
    this.analytics.errorCount++;
  }

  warn(message: string, context: any = {}) {
    this.log('WARN', message, context);
    this.analytics.warningCount++;
  }

  apiLog(method: string, url: string, status: number, responseTime: number, context: any = {}) {
    this.log('API', `${method} ${url} - ${status} (${responseTime}ms)`, {
      method,
      url,
      status,
      responseTime,
      ...context
    });
    this.analytics.apiCount++;
    this.analytics.performance.totalResponseTime += responseTime;
    this.analytics.performance.requestCount++;
  }

  updateAnalytics(level: string) {
    // Detectar patrones de error
    if (level === 'ERROR') {
      console.log('🚨 Frontend: Error detectado en API proxy');
    }
  }

  getAnalytics() {
    return {
      summary: {
        totalLogs: this.logs.length,
        errorCount: this.analytics.errorCount,
        warningCount: this.analytics.warningCount,
        infoCount: this.analytics.infoCount,
        apiCount: this.analytics.apiCount
      },
      performance: {
        averageResponseTime: this.analytics.performance.requestCount > 0 
          ? Math.round(this.analytics.performance.totalResponseTime / this.analytics.performance.requestCount)
          : 0
      },
      recentLogs: this.logs.slice(-5)
    };
  }
}

// === SISTEMA DE MANEJO DE ERRORES PARA FRONTEND ===
class FrontendErrorHandler {
  private errorHistory: any[] = [];

  classifyError(error: any) {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('api') || message.includes('http') || message.includes('500') || message.includes('404')) {
      return 'API_ERROR';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'AUTH_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  async handleError(error: any, context: any = {}) {
    const errorType = this.classifyError(error);
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorInfo = {
      id: errorId,
      type: errorType,
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      handled: true
    };
    
    this.errorHistory.push(errorInfo);
    
    console.log(`🔍 Frontend Error clasificado: ${errorType}`);
    console.log(`🆔 Error ID: ${errorId}`);
    
    return {
      handled: true,
      errorType,
      errorInfo
    };
  }

  getErrorReport() {
    return {
      recentErrors: this.errorHistory.slice(-10),
      totalErrors: this.errorHistory.length
    };
  }
}

// === INSTANCIAS GLOBALES ===
const frontendLogger = new FrontendLogger();
const frontendErrorHandler = new FrontendErrorHandler();

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'health';
    
    // LOGGING DINÁMICO: Log de la request
    frontendLogger.info(`GET request to GAS API`, { 
      action, 
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    
    // Usar caché inteligente para optimizar respuestas
    const cacheKey = `gas_api:${action}`;
    const cachedData = await intelligentCache.get(cacheKey, async () => {
      // Hacer petición a GAS con optimización de red
      return await networkOptimizer.executeWithOptimization(async () => {
        const response = await fetch(`${GAS_API_URL}?action=${action}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      });
    }, 'api');

    const responseTime = Date.now() - startTime;
    
    // LOGGING DINÁMICO: Log de respuesta exitosa
    frontendLogger.apiLog('GET', `/api/gas?action=${action}`, 200, responseTime, { 
      action, 
      success: true,
      cached: intelligentCache.cache.has(cacheKey),
      optimizations: {
        cache: intelligentCache.getMetrics(),
        network: networkOptimizer.getMetrics()
      }
    });
    
    return NextResponse.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString(),
      system: {
        dynamicLogging: true,
        responseTime: responseTime,
        optimizations: {
          cache: intelligentCache.getMetrics(),
          network: networkOptimizer.getMetrics()
        }
      }
    });

  } catch (error: any) {
    // MANEJO DINÁMICO DE ERRORES: Error en proxy
    const errorResult = await frontendErrorHandler.handleError(error, { 
      action: 'GET',
      critical: true 
    });
    
    frontendLogger.error('Error proxying to GAS API', error, { 
      action: 'GET',
      errorId: errorResult.errorInfo.id 
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorId: errorResult.errorInfo.id,
      errorType: errorResult.errorType,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'updateStreamer';
    const body = await request.json();
    
    console.log(`🔍 Proxying POST request to GAS API: action=${action}`, body);
    
    const response = await fetch(`${GAS_API_URL}?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error proxying to GAS API:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
