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
    const limit = parseInt(query.limit) || 10

    // Generate mock data for recent activities
    const generateMockData = () => {
      const activities = []
      const activityTypes = ['play', 'topup', 'video_approved', 'video_rejected']
      
      for (let i = 1; i <= limit; i++) {
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 30))
        
        let title = ''
        let description = ''
        
        switch (type) {
          case 'play':
            title = 'Video Played'
            description = `Your advertisement was played ${Math.floor(Math.random() * 100) + 1} times`
            break
          case 'topup':
            title = 'Balance Top-up'
            description = `Your account was credited with Rp${(Math.floor(Math.random() * 1000000) + 100000).toLocaleString('id-ID')}`
            break
          case 'video_approved':
            title = 'Video Approved'
            description = 'Your advertisement video has been approved and is now active'
            break
          case 'video_rejected':
            title = 'Video Rejected'
            description = 'Your advertisement video was rejected. Please check the requirements'
            break
        }
        
        activities.push({
          id: i,
          type: type,
          title: title,
          description: description,
          created_at: date.toISOString()
        })
      }
      
      return activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    const activitiesData = generateMockData()

    return {
      success: true,
      data: activitiesData
    }
  } catch (error) {
    console.error('Error in activities API:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})