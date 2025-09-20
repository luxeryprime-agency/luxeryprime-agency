// Configuración de la aplicación
export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Integración Agencia Streamers',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  },
  
  gas: {
    scriptId: process.env.GAS_SCRIPT_ID || '',
    deploymentId: process.env.GAS_DEPLOYMENT_ID || '',
  },
  
  googleSheets: {
    id: process.env.GOOGLE_SHEETS_ID || '',
    range: process.env.GOOGLE_SHEETS_RANGE || 'A1:Z1000',
  },
  
  apis: {
    openai: process.env.OPENAI_API_KEY || '',
    telegram: process.env.TELEGRAM_BOT_TOKEN || '',
    whatsapp: process.env.WHATSAPP_API_TOKEN || '',
  },
  
  cursor: {
    apiKey: process.env.CURSOR_API_KEY || '',
    backgroundAgentUrl: process.env.CURSOR_BACKGROUND_AGENT_URL || 'https://api.cursor.com/v1/background-agent',
  },
  
  database: {
    url: process.env.DATABASE_URL || '',
    serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '',
  },
  
  monitoring: {
    vercelAnalytics: process.env.VERCEL_ANALYTICS_ID || '',
    googleAnalytics: process.env.GOOGLE_ANALYTICS_ID || '',
  },
  
  development: {
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
  },
  
  testing: {
    jestEnv: process.env.JEST_TEST_ENV || 'test',
    cypressBaseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
  },
  
  security: {
    nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  
  notifications: {
    pushPublicKey: process.env.PUSH_NOTIFICATION_PUBLIC_KEY || '',
    pushPrivateKey: process.env.PUSH_NOTIFICATION_PRIVATE_KEY || '',
  },
};

export default config;
