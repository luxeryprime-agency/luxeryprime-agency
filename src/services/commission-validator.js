/**
 * VALIDADOR DE COMISIONES MEJORADO
 * Soluciona el error de cálculo de comisiones con nivel inválido
 */

class CommissionValidator {
  constructor() {
    this.validLevels = [1, 2, 3, 4, 5];
    this.levelMultipliers = {
      1: 0.05,  // 5% para nivel 1
      2: 0.10,  // 10% para nivel 2
      3: 0.15,  // 15% para nivel 3
      4: 0.20,  // 20% para nivel 4
      5: 0.25   // 25% para nivel 5
    };
  }

  /**
   * Validar datos de streamer antes del cálculo
   */
  validateStreamerData(streamerData) {
    const errors = [];
    const warnings = [];

    // Validar ID
    if (!streamerData.id || typeof streamerData.id !== 'string') {
      errors.push('ID de streamer es requerido y debe ser string');
    }

    // Validar nivel (CORRECCIÓN PRINCIPAL)
    if (!streamerData.level) {
      errors.push('Nivel de streamer es requerido');
    } else if (!this.validLevels.includes(streamerData.level)) {
      // Auto-corrección: asignar nivel por defecto basado en ganancias
      const suggestedLevel = this.suggestLevelByEarnings(streamerData.earnings);
      warnings.push(`Nivel inválido (${streamerData.level}). Sugerido: ${suggestedLevel}`);
      streamerData.level = suggestedLevel; // Auto-corrección
    }

    // Validar ganancias
    if (!streamerData.earnings || streamerData.earnings < 0) {
      errors.push('Ganancias deben ser un número positivo');
    }

    // Validar país
    if (!streamerData.country) {
      warnings.push('País no especificado, usando valor por defecto');
      streamerData.country = 'Colombia'; // Valor por defecto
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedData: streamerData
    };
  }

  /**
   * Sugerir nivel basado en ganancias
   */
  suggestLevelByEarnings(earnings) {
    if (earnings >= 10000) return 5;
    if (earnings >= 5000) return 4;
    if (earnings >= 2000) return 3;
    if (earnings >= 500) return 2;
    return 1;
  }

  /**
   * Calcular comisión con validación
   */
  async calculateCommission(streamerData) {
    try {
      // Validar datos primero
      const validation = this.validateStreamerData(streamerData);
      
      if (!validation.isValid) {
        throw new Error(`Datos de streamer inválidos: ${validation.errors.join(', ')}`);
      }

      // Usar datos corregidos
      const data = validation.correctedData;
      
      // Calcular comisión
      const baseEarnings = data.earnings;
      const level = data.level;
      const multiplier = this.levelMultipliers[level];
      
      if (!multiplier) {
        throw new Error(`Multiplicador no encontrado para nivel ${level}`);
      }

      const commission = baseEarnings * multiplier;
      
      return {
        success: true,
        commission,
        level,
        multiplier,
        baseEarnings,
        warnings: validation.warnings
      };

    } catch (error) {
      console.error('Error calculando comisión:', error);
      return {
        success: false,
        error: error.message,
        commission: 0
      };
    }
  }

  /**
   * Validar múltiples streamers
   */
  async validateMultipleStreamers(streamersData) {
    const results = [];
    
    for (const streamer of streamersData) {
      const result = await this.calculateCommission(streamer);
      results.push({
        streamerId: streamer.id,
        ...result
      });
    }

    return {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }
}

module.exports = CommissionValidator;