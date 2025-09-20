/**
 * Sistema de Comisiones - Luxery Prime Agency
 * Gestión automática de comisiones por niveles de streamers
 */

import firestoreService from './firestore.js';

class CommissionService {
  constructor() {
    this.firestore = firestoreService;
    this.commissionRates = {
      1: 0.15, // 15% para nivel 1
      2: 0.20, // 20% para nivel 2
      3: 0.25, // 25% para nivel 3
      4: 0.30, // 30% para nivel 4
      5: 0.35  // 35% para nivel 5
    };
  }

  /**
   * Calcular comisión para un streamer
   * @param {string} streamerId - ID del streamer
   * @param {number} amount - Monto base
   * @param {string} app - Aplicación (yameet, salsa, hiti, musee)
   * @returns {Object} - Detalles de la comisión
   */
  async calculateCommission(streamerId, amount, app) {
    try {
      // Obtener datos del streamer
      const streamer = await this.firestore.getStreamerById(streamerId);
      if (!streamer) {
        throw new Error(`Streamer ${streamerId} no encontrado`);
      }

      const level = streamer.level || 1;
      const commissionRate = this.commissionRates[level] || 0.15;
      const commissionAmount = amount * commissionRate;
      const netAmount = amount - commissionAmount;

      const commission = {
        id: `COMM_${Date.now()}_${streamerId}`,
        streamerId: streamerId,
        streamerName: streamer.name,
        agency: streamer.agency || 'luxeryprime',
        app: app,
        level: level,
        baseAmount: amount,
        commissionRate: commissionRate,
        commissionAmount: commissionAmount,
        netAmount: netAmount,
        status: 'pending', // pending, paid, failed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return commission;
    } catch (error) {
      console.error('Error calculando comisión:', error);
      throw error;
    }
  }

  /**
   * Crear comisión en la base de datos
   * @param {Object} commissionData - Datos de la comisión
   * @returns {Object} - Comisión creada
   */
  async createCommission(commissionData) {
    try {
      const commission = await this.firestore.createCommission(commissionData);
      
      // Notificar al streamer
      await this.notifyCommissionCreated(commission);
      
      return commission;
    } catch (error) {
      console.error('Error creando comisión:', error);
      throw error;
    }
  }

  /**
   * Obtener comisiones de un streamer
   * @param {string} streamerId - ID del streamer
   * @param {Object} filters - Filtros adicionales
   * @returns {Array} - Lista de comisiones
   */
  async getStreamerCommissions(streamerId, filters = {}) {
    try {
      const queryFilters = {
        streamerId: streamerId,
        ...filters
      };
      
      return await this.firestore.getCommissions(queryFilters);
    } catch (error) {
      console.error('Error obteniendo comisiones del streamer:', error);
      throw error;
    }
  }

  /**
   * Obtener comisiones de una agencia
   * @param {string} agencyId - ID de la agencia
   * @param {Object} filters - Filtros adicionales
   * @returns {Array} - Lista de comisiones
   */
  async getAgencyCommissions(agencyId, filters = {}) {
    try {
      const queryFilters = {
        agency: agencyId,
        ...filters
      };
      
      return await this.firestore.getCommissions(queryFilters);
    } catch (error) {
      console.error('Error obteniendo comisiones de la agencia:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de comisión
   * @param {string} commissionId - ID de la comisión
   * @param {string} status - Nuevo estado
   * @param {Object} additionalData - Datos adicionales
   * @returns {Object} - Comisión actualizada
   */
  async updateCommissionStatus(commissionId, status, additionalData = {}) {
    try {
      const updateData = {
        status: status,
        updatedAt: new Date().toISOString(),
        ...additionalData
      };

      const commission = await this.firestore.updateCommission(commissionId, updateData);
      
      // Notificar cambio de estado
      await this.notifyCommissionStatusChange(commission);
      
      return commission;
    } catch (error) {
      console.error('Error actualizando estado de comisión:', error);
      throw error;
    }
  }

  /**
   * Procesar lote de comisiones
   * @param {Array} commissions - Lista de comisiones a procesar
   * @returns {Object} - Resultado del procesamiento
   */
  async processCommissionBatch(commissions) {
    try {
      const results = {
        total: commissions.length,
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const commission of commissions) {
        try {
          await this.createCommission(commission);
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            commissionId: commission.id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error procesando lote de comisiones:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de comisiones
   * @param {string} agencyId - ID de la agencia
   * @param {Object} dateRange - Rango de fechas
   * @returns {Object} - Estadísticas
   */
  async getCommissionStats(agencyId, dateRange = {}) {
    try {
      const filters = {
        agency: agencyId,
        ...dateRange
      };

      const commissions = await this.firestore.getCommissions(filters);
      
      const stats = {
        total: commissions.length,
        totalAmount: 0,
        totalCommission: 0,
        byStatus: {},
        byLevel: {},
        byApp: {}
      };

      commissions.forEach(commission => {
        stats.totalAmount += commission.baseAmount;
        stats.totalCommission += commission.commissionAmount;
        
        // Por estado
        stats.byStatus[commission.status] = (stats.byStatus[commission.status] || 0) + 1;
        
        // Por nivel
        stats.byLevel[commission.level] = (stats.byLevel[commission.level] || 0) + 1;
        
        // Por app
        stats.byApp[commission.app] = (stats.byApp[commission.app] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de comisiones:', error);
      throw error;
    }
  }

  /**
   * Notificar comisión creada
   * @param {Object} commission - Comisión creada
   */
  async notifyCommissionCreated(commission) {
    try {
      // Aquí se implementaría la notificación
      // Por ejemplo: WhatsApp, Email, etc.
      console.log(`📢 Comisión creada para ${commission.streamerName}: $${commission.commissionAmount}`);
    } catch (error) {
      console.error('Error notificando comisión creada:', error);
    }
  }

  /**
   * Notificar cambio de estado de comisión
   * @param {Object} commission - Comisión actualizada
   */
  async notifyCommissionStatusChange(commission) {
    try {
      // Aquí se implementaría la notificación
      console.log(`📢 Comisión ${commission.id} actualizada a estado: ${commission.status}`);
    } catch (error) {
      console.error('Error notificando cambio de estado:', error);
    }
  }
}

const commissionService = new CommissionService();
export default commissionService;
