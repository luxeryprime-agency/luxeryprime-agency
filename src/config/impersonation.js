// Configuración de impersonación de cuenta de servicio
const { GoogleAuth } = require('google-auth-library');

const IMPERSONATION_CONFIG = {
  projectId: 'luxeryprime-agency',
  serviceAccountEmail: 'luxeryprime-service-account@luxeryprime-agency.iam.gserviceaccount.com',
  userEmail: 'info@luxeryprimeagency.com'
};

async function getAuthenticatedClient() {
  const auth = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/firestore',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
    // Usar impersonación en lugar de Service Account Key
    targetPrincipal: IMPERSONATION_CONFIG.serviceAccountEmail
  });

  return await auth.getClient();
}

module.exports = {
  IMPERSONATION_CONFIG,
  getAuthenticatedClient
};
