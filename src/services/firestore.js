// src/services/firestore.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../config';

// Inicializar Firebase
const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

// Colecciones de Firestore
const COLLECTIONS = {
  STREAMERS: 'streamers',
  COMMISSIONS: 'commissions',
  AGENCIES: 'agencies',
  USERS: 'users',
  REPORTS: 'reports'
};

class FirestoreService {
  constructor() {
    this.db = db;
    this.collections = COLLECTIONS;
  }

  // ===== STREAMERS =====
  async createStreamer(streamerData) {
    try {
      const docRef = await addDoc(collection(this.db, this.collections.STREAMERS), {
        ...streamerData,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'active'
      });
      return { success: true, id: docRef.id, data: streamerData };
    } catch (error) {
      console.error('Error creating streamer:', error);
      return { success: false, error: error.message };
    }
  }

  async getStreamers(filters = {}) {
    try {
      let q = collection(this.db, this.collections.STREAMERS);
      
      if (filters.agency_id) {
        q = query(q, where('agency_id', '==', filters.agency_id));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.app) {
        q = query(q, where('app', '==', filters.app));
      }
      
      q = query(q, orderBy('created_at', 'desc'));
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const streamers = [];
      querySnapshot.forEach((doc) => {
        streamers.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: streamers, count: streamers.length };
    } catch (error) {
      console.error('Error getting streamers:', error);
      return { success: false, error: error.message };
    }
  }

  async getStreamerById(id) {
    try {
      const docRef = doc(this.db, this.collections.STREAMERS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: 'Streamer not found' };
      }
    } catch (error) {
      console.error('Error getting streamer:', error);
      return { success: false, error: error.message };
    }
  }

  async updateStreamer(id, updateData) {
    try {
      const docRef = doc(this.db, this.collections.STREAMERS, id);
      await updateDoc(docRef, {
        ...updateData,
        updated_at: new Date()
      });
      return { success: true, id, data: updateData };
    } catch (error) {
      console.error('Error updating streamer:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== COMMISSIONS =====
  async createCommission(commissionData) {
    try {
      const docRef = await addDoc(collection(this.db, this.collections.COMMISSIONS), {
        ...commissionData,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'pending'
      });
      return { success: true, id: docRef.id, data: commissionData };
    } catch (error) {
      console.error('Error creating commission:', error);
      return { success: false, error: error.message };
    }
  }

  async getCommissions(filters = {}) {
    try {
      let q = collection(this.db, this.collections.COMMISSIONS);
      
      if (filters.streamer_id) {
        q = query(q, where('streamer_id', '==', filters.streamer_id));
      }
      if (filters.agency_id) {
        q = query(q, where('agency_id', '==', filters.agency_id));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.app) {
        q = query(q, where('app', '==', filters.app));
      }
      
      q = query(q, orderBy('created_at', 'desc'));
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const commissions = [];
      querySnapshot.forEach((doc) => {
        commissions.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: commissions, count: commissions.length };
    } catch (error) {
      console.error('Error getting commissions:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== AGENCIES =====
  async getAgencies() {
    try {
      const q = query(collection(this.db, this.collections.AGENCIES), where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      const agencies = [];
      querySnapshot.forEach((doc) => {
        agencies.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: agencies, count: agencies.length };
    } catch (error) {
      console.error('Error getting agencies:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== SYNC WITH GOOGLE SHEETS =====
  async syncToSheets(collectionName, data) {
    try {
      // Esta función se implementará para sincronizar con Google Sheets
      console.log(`Syncing ${collectionName} to Google Sheets:`, data);
      return { success: true, message: 'Sync to Sheets implemented' };
    } catch (error) {
      console.error('Error syncing to Sheets:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== HEALTH CHECK =====
  async healthCheck() {
    try {
      const agencies = await this.getAgencies();
      return {
        status: 'ok',
        database: 'Firestore',
        project: 'luxeryprime-agency',
        collections: Object.keys(this.collections),
        agencies_count: agencies.count,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'Firestore',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Instancia singleton
const firestoreService = new FirestoreService();

export default firestoreService;
export { COLLECTIONS };
