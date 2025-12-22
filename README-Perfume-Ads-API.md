# Perfume Video Ads API

This document explains how to retrieve perfume video ads objects containing brand ID and video lists from the Scentral video player manifest API.

## API Endpoint

The main API endpoint is:
```
http://192.168.18.132:3030/api/video-player/manifest/866902946400001
```

This endpoint returns a video player manifest that includes perfume ads in the `perfume_ads` field. Each perfume ad contains brand information including `brand_id` and `brand_name`.

**Important Note:** Perfume ads are now treated like default videos in the backend - they are included in the manifest as long as the video has `ad_type="perfume"` and `status="active"`, regardless of slot assignments or other restrictions. Slots are only used for general ads.

## Response Structure

The API response includes a `perfume_ads` array with the following structure for each ad:

```json
{
  "id": 1,
  "title": "Perfume Ad Title",
  "description": "Ad description",
  "file_path": "path/to/video.mp4",
  "thumbnail_path": "path/to/thumbnail.jpg",
  "duration_seconds": 30,
  "cost_per_play": 0.15,
  "brand_id": 5,
  "brand_name": "Brand Name",
  "priority": "high",
  "play_count": 10,
  "last_played": "2023-10-22T10:30:00Z"
}
```

## Created Resources

### 1. Nuxt API Endpoint (`/api/perfume-ads`)

A custom API endpoint that fetches all active perfume videos and groups them by brand:

**Data Source:**
- Fetches data from the manifest API which now correctly includes all active perfume videos
- The backend handles the logic of including all active perfume videos regardless of slots

**Usage:**
```
GET /api/perfume-ads?machineId=866902946400001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "machine_id": "866902946400001",
    "total_brands": 3,
    "total_videos": 8,
    "perfume_ads": [
      {
        "brand_id": 5,
        "brand_name": "Brand Name",
        "videos": [
          {
            "id": 1,
            "title": "Perfume Ad Title",
            "description": "Ad description",
            "file_path": "path/to/video.mp4",
            "thumbnail_path": "path/to/thumbnail.jpg",
            "duration_seconds": 30,
            "cost_per_play": 0.15,
            "priority": "high",
            "play_count": 10,
            "last_played": "2023-10-22T10:30:00Z"
          }
        ]
      }
    ]
  }
}
```

### 2. Vue Test Page (`/test-perfume-ads`)

A Vue.js page that provides a user-friendly interface to view perfume ads grouped by brand. Features include:

- Search by machine ID
- View total brands and videos statistics
- Expandable brand sections with video details
- Video preview functionality
- Copy video URL to clipboard

### 3. HTML Demo Page (`/perfume-ads-demo.html`)

A standalone HTML page that can be opened directly in a browser without needing the Nuxt application. It includes:

- Bootstrap styling
- Interactive UI to fetch and display perfume ads
- Video preview functionality
- Copy to clipboard feature

### 4. Node.js Script (`scripts/fetch-perfume-ads.js`)

A command-line script to fetch and display perfume ads data:

**Usage:**
```bash
# Using default machine ID
node scripts/fetch-perfume-ads.js

# With custom machine ID
node scripts/fetch-perfume-ads.js 866902946400001
```

The script outputs:
- Formatted text display of all perfume ads grouped by brand
- JSON output for programmatic use

## How to Use

### Option 1: Direct API Call

Make a GET request to the manifest API:
```bash
curl http://192.168.18.132:3030/api/video-player/manifest/866902946400001
```

Then parse the `perfume_ads` array from the response.

### Option 2: Use the Custom API Endpoint

```bash
curl http://localhost:3000/api/perfume-ads?machineId=866902946400001
```

This returns perfume ads already grouped by brand.

### Option 3: Use the Vue Page

Navigate to `/test-perfume-ads` in your browser to use the interactive interface.

### Option 4: Use the HTML Demo Page

Open `public/perfume-ads-demo.html` directly in your browser.

### Option 5: Use the Node.js Script

Run the script from the command line as shown above.

## Data Structure

The perfume ads are grouped by brand with the following structure:

```json
{
  "brand_id": 5,
  "brand_name": "Brand Name",
  "videos": [
    {
      "id": 1,
      "title": "Video Title",
      "description": "Video Description",
      "file_path": "path/to/video.mp4",
      "thumbnail_path": "path/to/thumbnail.jpg",
      "duration_seconds": 30,
      "cost_per_play": 0.15,
      "priority": "high",
      "play_count": 10,
      "last_played": "2023-10-22T10:30:00Z"
    }
  ]
}
```

## Notes

- The machine ID `866902946400001` is used as an example. Replace it with your actual machine ID.
- The API endpoint `http://192.168.18.132:3030` should be replaced with your actual server URL.
- **All active perfume videos are returned regardless of slot assignments or machine-specific configurations.**
- Only videos with `ad_type="perfume"` and `status="active"` are included in the results.
- **Backend Implementation:** The backend now treats perfume ads like default videos - they are included in the manifest if active, without being tied to specific slot assignments.
- **Slot Assignment:** Slots are now only used for general ads. Perfume ads are globally available as long as they are active.