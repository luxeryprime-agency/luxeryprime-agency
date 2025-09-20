/**
 * VALIDADOR DE STREAMERS MEJORADO
 * Soluciona el error de validación de email y otros datos
 */

class StreamerValidator {
  constructor() {
    this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.validCountries = ['Colombia', 'México', 'Venezuela', 'Perú', 'Ecuador', 'Chile', 'Argentina'];
    this.phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  }

  /**
   * Validar email con corrección automática
   */
  validateEmail(email) {
    if (!email) {
      return {
        isValid: false,
        error: 'Email es requerido',
        corrected: null
      };
    }

    // Limpiar email
    const cleanedEmail = email.toLowerCase().trim();
    
    if (!this.emailRegex.test(cleanedEmail)) {
      // Intentar corrección automática
      const corrected = this.attemptEmailCorrection(cleanedEmail);
      
      return {
        isValid: false,
        error: 'Formato de email inválido',
        corrected: corrected,
        original: email
      };
    }

    return {
      isValid: true,
      corrected: cleanedEmail
    };
  }

  /**
   * Intentar corregir email automáticamente
   */
  attemptEmailCorrection(email) {
    // Correcciones comunes
    const corrections = {
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

    // Si no se puede corregir, sugerir formato
    return null;
  }

  /**
   * Validar datos completos del streamer
   */
  validateStreamer(streamerData) {
    const errors = [];
    const warnings = [];
    const correctedData = { ...streamerData };

    // Validar ID
    if (!streamerData.id) {
      errors.push('ID de streamer es requerido');
    } else {
      correctedData.id = streamerData.id.toString().trim();
    }

    // Validar nombre
    if (!streamerData.name) {
      errors.push('Nombre es requerido');
    } else {
      correctedData.name = streamerData.name.trim();
      if (correctedData.name.length < 2) {
        errors.push('Nombre debe tener al menos 2 caracteres');
      }
    }

    // Validar email (CORRECCIÓN PRINCIPAL)
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
      warnings.push('País no especificado, usando Colombia por defecto');
      correctedData.country = 'Colombia';
    } else {
      const country = streamerData.country.trim();
      if (!this.validCountries.includes(country)) {
        // Buscar país similar
        const similarCountry = this.findSimilarCountry(country);
        if (similarCountry) {
          correctedData.country = similarCountry;
          warnings.push(`País corregido: ${country} → ${similarCountry}`);
        } else {
          errors.push(`País no válido: ${country}. Países válidos: ${this.validCountries.join(', ')}`);
        }
      } else {
        correctedData.country = country;
      }
    }

    // Validar nivel
    if (!streamerData.level || streamerData.level < 1 || streamerData.level > 5) {
      warnings.push('Nivel inválido, asignando nivel 1 por defecto');
      correctedData.level = 1;
    }

    // Validar ganancias
    if (!streamerData.earnings || streamerData.earnings < 0) {
      errors.push('Ganancias deben ser un número positivo');
    } else {
      correctedData.earnings = parseFloat(streamerData.earnings);
    }

    // Validar teléfono (opcional)
    if (streamerData.phone) {
      const phone = streamerData.phone.replace(/\s/g, '');
      if (!this.phoneRegex.test(phone)) {
        warnings.push('Formato de teléfono inválido, pero es opcional');
      } else {
        correctedData.phone = phone;
      }
    }

    // Validar Binance email (opcional)
    if (streamerData.binanceEmail) {
      const binanceValidation = this.validateEmail(streamerData.binanceEmail);
      if (!binanceValidation.isValid) {
        if (binanceValidation.corrected) {
          correctedData.binanceEmail = binanceValidation.corrected;
          warnings.push(`Email Binance corregido: ${streamerData.binanceEmail} → ${binanceValidation.corrected}`);
        } else {
          warnings.push('Email Binance inválido, pero es opcional');
          correctedData.binanceEmail = null;
        }
      } else {
        correctedData.binanceEmail = binanceValidation.corrected;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedData,
      hasCorrections: warnings.length > 0
    };
  }

  /**
   * Buscar país similar
   */
  findSimilarCountry(inputCountry) {
    const input = inputCountry.toLowerCase();
    
    for (const country of this.validCountries) {
      if (country.toLowerCase().includes(input) || input.includes(country.toLowerCase())) {
        return country;
      }
    }
    
    return null;
  }

  /**
   * Validar múltiples streamers
   */
  validateMultipleStreamers(streamersData) {
    const results = [];
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalCorrections = 0;

    for (const streamer of streamersData) {
      const validation = this.validateStreamer(streamer);
      
      results.push({
        streamerId: streamer.id,
        ...validation
      });

      totalErrors += validation.errors.length;
      totalWarnings += validation.warnings.length;
      if (validation.hasCorrections) totalCorrections++;
    }

    return {
      total: results.length,
      successful: results.filter(r => r.isValid).length,
      failed: results.filter(r => !r.isValid).length,
      totalErrors,
      totalWarnings,
      totalCorrections,
      results
    };
  }

  /**
   * Generar reporte de validación
   */
  generateValidationReport(validationResults) {
    return {
      summary: {
        total: validationResults.total,
        successful: validationResults.successful,
        failed: validationResults.failed,
        successRate: ((validationResults.successful / validationResults.total) * 100).toFixed(1) + '%'
      },
      issues: {
        errors: validationResults.totalErrors,
        warnings: validationResults.totalWarnings,
        corrections: validationResults.totalCorrections
      },
      details: validationResults.results
    };
  }
}

module.exports = StreamerValidator;