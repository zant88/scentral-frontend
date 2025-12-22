#!/usr/bin/env node

/**
 * Script to fetch and display perfume video ads from the API
 * Usage: node scripts/fetch-perfume-ads.js [machineId]
 */

const https = require('https');
const http = require('http');

// Get machine ID from command line arguments or use default
const machineId = process.argv[2] || '866902946400001';
const apiUrl = `http://192.168.18.132:3030/api/video-player/manifest/${machineId}`;

console.log(`Fetching perfume ads for machine: ${machineId}`);
console.log(`API URL: ${apiUrl}`);
console.log('----------------------------------------');

// Function to make HTTP request
function fetchData(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.end();
  });
}

// Main function
async function main() {
  try {
    // Fetch data from manifest API
    // The backend now correctly includes all active perfume videos regardless of slot assignments
    console.log('Fetching perfume videos from manifest API...');
    const response = await fetchData(apiUrl);
    
    if (!response.success) {
      console.error(`Error: ${response.message || 'Failed to fetch manifest'}`);
      process.exit(1);
    }
    
    const manifest = response.data;
    const perfumeAds = manifest.perfume_ads || [];
    const source = "manifest_api";
    
    console.log(`Fetched ${perfumeAds.length} perfume videos from manifest API`);
    console.log('Note: Perfume ads are included if active, regardless of slot assignments');
    
    // Group perfume ads by brand
    const perfumeAdsByBrand = {};
    
    perfumeAds.forEach(ad => {
      const brandId = ad.brand_id;
      const brandName = ad.brand_name || `Brand ${brandId}`;
      
      if (!perfumeAdsByBrand[brandId]) {
        perfumeAdsByBrand[brandId] = {
          brand_id: brandId,
          brand_name: brandName,
          videos: []
        };
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
      });
    });
    
    // Convert to array
    const result = Object.values(perfumeAdsByBrand);
    
    // Display results
    console.log(`Data Source: ${source}`);
    console.log(`Total Brands: ${result.length}`);
    console.log(`Total Perfume Videos: ${perfumeAds.length}`);
    console.log('Note: Perfume ads are included if active, regardless of slot assignments');
    console.log('');
    
    if (result.length === 0) {
      console.log('No perfume ads found for this machine.');
      return;
    }
    
    // Display each brand and its videos
    result.forEach((brand, index) => {
      console.log(`Brand ${index + 1}: ${brand.brand_name} (ID: ${brand.brand_id})`);
      console.log(`Videos: ${brand.videos.length}`);
      console.log('----------------------------------------');
      
      brand.videos.forEach((video, videoIndex) => {
        console.log(`  Video ${videoIndex + 1}: ${video.title}`);
        console.log(`    ID: ${video.id}`);
        console.log(`    Duration: ${video.duration_seconds}s`);
        console.log(`    Cost per play: $${video.cost_per_play}`);
        console.log(`    Priority: ${video.priority}`);
        console.log(`    Play count: ${video.play_count}`);
        console.log(`    Last played: ${video.last_played || 'Never'}`);
        console.log(`    Description: ${video.description || 'No description'}`);
        console.log(`    Video URL: ${video.file_path}`);
        console.log('');
      });
      
      console.log('');
    });
    
    // Output JSON format
    console.log('JSON Output:');
    console.log('----------------------------------------');
    console.log(JSON.stringify({
      machine_id: machineId,
      total_brands: result.length,
      total_videos: perfumeAds.length,
      perfume_ads: result,
      source: source
    }, null, 2));
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();