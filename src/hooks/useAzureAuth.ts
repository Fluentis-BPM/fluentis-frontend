import { useCallback } from 'react'
import { azureConfig } from '@/config/azure'

export const useAzureAuth = () => {
  const buildAuthUrl = useCallback(() => {
    const authEndpoint = `${azureConfig.instance}${azureConfig.tenantId}/oauth2/v2.0/authorize`
    const params = new URLSearchParams({
      client_id: azureConfig.clientId,
      response_type: 'code',
      redirect_uri: azureConfig.redirectUri,
      scope: azureConfig.scope.join(' '),
      response_mode: 'query'
    })
    return `${authEndpoint}?${params.toString()}`
  }, [])

  const handleLogin = useCallback(() => {
    window.location.href = buildAuthUrl()
  }, [buildAuthUrl])

  return { handleLogin }
}