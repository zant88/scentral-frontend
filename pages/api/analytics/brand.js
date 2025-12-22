export default defineEventHandler(async (event) => {
  try {
    // Get the authorization header
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

    // Get brand ID from token (this would normally come from JWT middleware)
    // For now, we'll extract it from a query parameter for testing
    const brandId = query.brand_id || '1'

    // Call the real backend API
    const config = useRuntimeConfig()
    const response = await $fetch(`${config.public.apiBase}/api/analytics/brand/${brandId}?period=${period}`, {
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

    // Transform backend data to match expected frontend format
    const transformedData = {
      total_plays: data.data?.summary?.total_plays || 0,
      total_spend: data.data?.summary?.total_cost || 0,
      active_videos: Math.floor(Math.random() * 20) + 5, // Keep some randomness for demo
      general_plays: Math.floor(Math.random() * 50000) + 25000, // Keep some randomness for demo
      perfume_plays: Math.floor(Math.random() * 50000) + 25000, // Keep some randomness for demo
    }

    return {
      success: true,
      data: transformedData
    }
  } catch (error) {
    console.error('Error in brand analytics API:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})
