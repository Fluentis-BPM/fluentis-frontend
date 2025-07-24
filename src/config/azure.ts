
export const azureConfig = {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || '',
    instance: 'https://login.microsoftonline.com/',
    scope: ['user.read']
  } as const