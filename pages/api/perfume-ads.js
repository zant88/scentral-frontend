export default defineEventHandler(async (event) => {
  try {
    // Get machine ID from query parameters or use the default one
    const query = getQuery(event)
    const machineId = query.machineId || '866902946400001'
    
    // Fetch the manifest from the backend API
    // The backend now correctly includes all active perfume videos regardless of slot assignments
    const response = await fetch(`http://192.168.18.132:3030/api/video-player/manifest/${machineId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch manifest')
    }
    
    // Extract perfume ads from the manifest
    // The backend now treats perfume ads like default videos - included if active, regardless of slots
    const perfumeAds = data.data.perfume_ads || []
    
    // Ensure we have perfume videos to process
    if (perfumeAds.length === 0) {
      return {
        success: true,
        data: {
          machine_id: machineId,
          total_brands: 0,
          total_videos: 0,
          perfume_ads: [],
          message: "No active perfume videos found"
        }
      }
    }
    
    // Group perfume ads by brand
    const perfumeAdsByBrand = {}
    
    perfumeAds.forEach(ad => {
      const brandId = ad.brand_id
      const brandName = ad.brand_name || `Brand ${brandId}`
      
      if (!perfumeAdsByBrand[brandId]) {
        perfumeAdsByBrand[brandId] = {
          brand_id: brandId,
          brand_name: brandName,
          videos: []
        }
      }
      
      perfumeAdsByBrand[brandId].videos.push({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        file_path: ad.file_path,
        thumbnail_path: ad.thumbnail_path,
        duration_seconds: ad.duration_seconds,
        cost_per_play: ad.cost_per_play,
        priority: ad.priority,
        play_count: ad.play_count,
        last_played: ad.last_played
      })
    })
    
    // Convert to array format
    const result = Object.values(perfumeAdsByBrand)
    
    return {
      success: true,
      data: {
        machine_id: machineId,
        total_brands: result.length,
        total_videos: perfumeAds.length,
        perfume_ads: result,
        source: "manifest_api",
        note: "Perfume ads are included if active, regardless of slot assignments"
      }
    }
  } catch (error) {
    console.error('Error fetching perfume ads:', error)
    
    return {
      success: false,
      message: error.message,
      data: null
    }
  }
})