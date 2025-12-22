export default defineEventHandler(async (event) => {
  try {
    // Get authorization header
    const authorization = getHeader(event, 'authorization')
    
    if (!authorization) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header is missing'
      })
    }

    // Extract token from Bearer token
    const token = authorization.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Access token is missing'
      })
    }

    // Get query parameters
    const query = getQuery(event)
    const period = query.period || '30d'
    const limit = query.limit || '10'

    // Get brand ID from token (this would normally come from JWT middleware)
    // For now, we'll extract it from a query parameter for testing
    const brandId = query.brand_id || '1'

    // Call the real backend API
    const config = useRuntimeConfig()
    const response = await $fetch(`${config.public.apiBase}/api/analytics/videos?brand_id=${brandId}&period=${period}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Backend API error: ${response.statusText}`
      })
    }

    const data = await response.json()

    return {
      success: true,
      data: data.data || []
    }
  } catch (error) {
    console.error('Error in videos analytics API:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})
