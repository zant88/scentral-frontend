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

    // Get user data from token (in a real implementation, you would validate the token)
    // For now, we'll simulate a brand user
    const brandId = 1 // This should be extracted from the validated token

    // Generate mock data for spend-balance analytics
    const generateMockData = () => {
      const currentDate = new Date()
      const data = {
        current_balance: 2500000,
        periods: {
          last_7_days: {
            spend_data: [],
            balance_data: [],
            total_spend: 0
          },
          last_30_days: {
            spend_data: [],
            balance_data: [],
            total_spend: 0
          },
          last_90_days: {
            spend_data: [],
            balance_data: [],
            total_spend: 0
          }
        }
      }

      // Generate data for last 7 days
      let balance = 2500000
      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const spend = Math.floor(Math.random() * 500000) + 100000
        balance -= spend
        
        data.periods.last_7_days.spend_data.push({
          date: dateStr,
          spend: spend
        })
        
        data.periods.last_7_days.balance_data.push({
          date: dateStr,
          balance: balance
        })
        
        data.periods.last_7_days.total_spend += spend
      }

      // Generate data for last 30 days
      balance = 2500000
      for (let i = 29; i >= 0; i--) {
        const date = new Date(currentDate)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const spend = Math.floor(Math.random() * 500000) + 100000
        balance -= spend
        
        data.periods.last_30_days.spend_data.push({
          date: dateStr,
          spend: spend
        })
        
        data.periods.last_30_days.balance_data.push({
          date: dateStr,
          balance: balance
        })
        
        data.periods.last_30_days.total_spend += spend
      }

      // Generate data for last 90 days
      balance = 2500000
      for (let i = 89; i >= 0; i--) {
        const date = new Date(currentDate)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const spend = Math.floor(Math.random() * 500000) + 100000
        balance -= spend
        
        data.periods.last_90_days.spend_data.push({
          date: dateStr,
          spend: spend
        })
        
        data.periods.last_90_days.balance_data.push({
          date: dateStr,
          balance: balance
        })
        
        data.periods.last_90_days.total_spend += spend
      }

      return data
    }

    const spendBalanceData = generateMockData()

    return {
      success: true,
      data: spendBalanceData
    }
  } catch (error) {
    console.error('Error in spend-balance API:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})