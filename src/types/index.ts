// Tipos globales del proyecto
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'leader' | 'streamer';
  createdAt: Date;
  updatedAt: Date;
}

export interface Streamer {
  id: string;
  userId: string;
  name: string;
  platform: 'twitch' | 'youtube' | 'tiktok' | 'instagram';
  followers: number;
  commission: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface Commission {
  id: string;
  streamerId: string;
  amount: number;
  percentage: number;
  date: Date;
  status: 'pending' | 'approved' | 'paid';
}

export interface Agency {
  id: string;
  name: string;
  streamers: string[];
  leaders: string[];
  settings: AgencySettings;
}

export interface AgencySettings {
  commissionRate: number;
  paymentMethod: 'binance' | 'paypal' | 'bank';
  notificationChannels: string[];
}

// Tipos para APIs
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para formularios
export interface FormData {
  [key: string]: any;
}

// Tipos para notificaciones
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}
