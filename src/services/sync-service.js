// src/services/sync-service.js
import firestoreService from './firestore.js';

class SyncService {
  constructor() {
    this.firestore = firestoreService;
    this.syncInterval = 30000; // 30 segundos
    this.isSyncing = false;
  }

  // ===== FIRESTORE → SHEETS =====
  async syncStreamersToSheets() {
    try {
      console.log('🔄 Sincronizando Streamers: Firestore → Sheets');
      
      // Obtener datos de Firestore
      const result = await this.firestore.getStreamers();
      if (!result.success) {
        throw new Error(result.error);
      }

      // Preparar datos para Sheets
      const headers = [
        'ID', 'Nombre', 'App', 'Nivel', 'Comision', 'Agencia', 
        'Telefono', 'Email', 'Estado', 'Fecha_Registro', 'Ultima_Actualizacion'
      ];

      const rows = result.data.map(streamer => [
        streamer.id,
        streamer.name || '',
        streamer.app || '',
        streamer.level || 1,
        streamer.commission || 0,
        streamer.agency_id || '',
        streamer.phone || '',
        streamer.email || '',
        streamer.status || 'active',
        streamer.created_at ? new Date(streamer.created_at.seconds * 1000).toISOString().split('T')[0] : '',
        streamer.updated_at ? new Date(streamer.updated_at.seconds * 1000).toISOString().split('T')[0] : ''
      ]);

      // Llamar a GAS API para actualizar Sheets
      const response = await fetch(`${process.env.NEXT_PUBLIC_GAS_API_URL}?action=syncStreamersToSheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headers: headers,
          data: rows
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Streamers sincronizados exitosamente');
        return { success: true, count: rows.length };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error sincronizando Streamers:', error);
      return { success: false, error: error.message };
    }
  }

  async syncCommissionsToSheets() {
    try {
      console.log('🔄 Sincronizando Comisiones: Firestore → Sheets');
      
      // Obtener datos de Firestore
      const result = await this.firestore.getCommissions();
      if (!result.success) {
        throw new Error(result.error);
      }

      // Preparar datos para Sheets
      const headers = [
        'ID', 'Streamer_ID', 'App', 'Monto_Base', 'Comision_Streamer', 
        'Comision_Lider', 'Comision_Agencia', 'Total_Comision', 
        'Fecha', 'Estado', 'Metodo_Pago'
      ];

      const rows = result.data.map(commission => [
        commission.id,
        commission.streamer_id || '',
        commission.app || '',
        commission.base_amount || 0,
        commission.streamer_commission || 0,
        commission.leader_commission || 0,
        commission.agency_commission || 0,
        commission.total_commission || 0,
        commission.created_at ? new Date(commission.created_at.seconds * 1000).toISOString().split('T')[0] : '',
        commission.status || 'pending',
        commission.payment_method || 'Binance'
      ]);

      // Llamar a GAS API para actualizar Sheets
      const response = await fetch(`${process.env.NEXT_PUBLIC_GAS_API_URL}?action=syncCommissionsToSheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headers: headers,
          data: rows
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Comisiones sincronizadas exitosamente');
        return { success: true, count: rows.length };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error sincronizando Comisiones:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== SHEETS → FIRESTORE =====
  async syncStreamersFromSheets() {
    try {
      console.log('🔄 Sincronizando Streamers: Sheets → Firestore');
      
      // Obtener datos de Sheets via GAS API
      const response = await fetch(`${process.env.NEXT_PUBLIC_GAS_API_URL}?action=getStreamersFromSheets`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Procesar cada streamer
      for (const streamerData of result.data) {
        // Verificar si existe en Firestore
        const existing = await this.firestore.getStreamerById(streamerData.ID);
        
        if (existing.success) {
          // Actualizar existente
          await this.firestore.updateStreamer(streamerData.ID, {
            name: streamerData.Nombre,
            app: streamerData.App,
            level: parseInt(streamerData.Nivel),
            commission: parseFloat(streamerData.Comision),
            agency_id: streamerData.Agencia,
            phone: streamerData.Telefono,
            email: streamerData.Email,
            status: streamerData.Estado
          });
        } else {
          // Crear nuevo
          await this.firestore.createStreamer({
            id: streamerData.ID,
            name: streamerData.Nombre,
            app: streamerData.App,
            level: parseInt(streamerData.Nivel),
            commission: parseFloat(streamerData.Comision),
            agency_id: streamerData.Agencia,
            phone: streamerData.Telefono,
            email: streamerData.Email,
            status: streamerData.Estado
          });
        }
      }

      console.log('✅ Streamers sincronizados desde Sheets');
      return { success: true, count: result.data.length };
    } catch (error) {
      console.error('❌ Error sincronizando desde Sheets:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== SINCRONIZACIÓN COMPLETA =====
  async fullSync() {
    if (this.isSyncing) {
      console.log('⏳ Sincronización ya en progreso...');
      return { success: false, error: 'Sync already in progress' };
    }

    this.isSyncing = true;
    console.log('🚀 Iniciando sincronización completa...');

    try {
      const results = {
        streamers_to_sheets: await this.syncStreamersToSheets(),
        commissions_to_sheets: await this.syncCommissionsToSheets(),
        streamers_from_sheets: await this.syncStreamersFromSheets()
      };

      const allSuccess = Object.values(results).every(result => result.success);
      
      console.log('📊 Resumen de sincronización:', results);
      
      return {
        success: allSuccess,
        results: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error en sincronización completa:', error);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  // ===== SINCRONIZACIÓN AUTOMÁTICA =====
  startAutoSync() {
    console.log('🔄 Iniciando sincronización automática cada 30 segundos...');
    
    setInterval(async () => {
      if (!this.isSyncing) {
        await this.fullSync();
      }
    }, this.syncInterval);
  }

  stopAutoSync() {
    console.log('⏹️ Deteniendo sincronización automática...');
    // En una implementación real, guardarías el ID del interval
  }
}

// Instancia singleton
const syncService = new SyncService();

export default syncService;
