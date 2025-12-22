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

    // Generate mock data for brand profile
    const generateMockData = () => {
      return {
        id: 1,
        name: 'Sample Brand Company',
        email: 'brand@example.com',
        balance: 2500000,
        logo_url: '/img/avatar/avatar-1.png',
        phone: '+62 812-3456-7890',
        address: 'Jakarta, Indonesia',
        description: 'Leading brand in digital advertising',
        status: 'active',
        created_at: '2023-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      }
    }

    const brandProfileData = generateMockData()

    return {
      success: true,
      data: brandProfileData
    }
  } catch (error) {
    console.error('Error in brand profile API:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})