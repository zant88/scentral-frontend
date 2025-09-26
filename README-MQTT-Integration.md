# MQTT Integration for Ads Page

This document explains how the MQTT integration works with the ads page to dynamically switch video playlists based on product purchases.

## How It Works

1. **MQTT Plugin Enhancement**: The MQTT plugin now supports registering custom message handlers for specific machine codes.

2. **Ads Page Integration**: Each ads page registers a custom MQTT handler for its machine ID when mounted and unregisters it when unmounted.

3. **Dynamic Playlist Switching**: When a product is dispensed (MQTT message received), the system:
   - Fetches the product details to get the brand ID
   - Fetches brand-specific advertisements
   - Switches the current playlist to show only that brand's videos
   - Continues looping through the brand videos

## MQTT Message Format

The MQTT message should be sent to the topic `scentral/advertising/state` with the following JSON structure:

```json
{
  "machine_code": "MACHINE_001",
  "product_id": "12345",
  "action": "product_dispensed",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Required Fields:
- `machine_code`: The unique identifier for the vending machine
- `product_id`: The ID of the product that was dispensed

### Optional Fields:
- `action`: Type of action (e.g., "product_dispensed", "machine_status")
- `timestamp`: When the event occurred

## Required API Endpoints

The following API endpoints must be available for the integration to work:

### 1. Get Product Details
```
GET /api/product/{product_id}
```

Response:
```json
{
  "id": "12345",
  "name": "Product Name",
  "brand_id": "67890",
  "category_id": "111",
  "price": 2.50
}
```

### 2. Get Brand-Specific Advertisements
```
GET /api/advertisement/brand/{brand_id}
```

Response:
```json
[
  {
    "id": "ad_001",
    "title": "Brand Advertisement 1",
    "description": "Description of the ad",
    "video_url": "/videos/brand_ad_1.mp4",
    "brand_id": "67890",
    "duration": 30,
    "active": true
  },
  {
    "id": "ad_002",
    "title": "Brand Advertisement 2",
    "description": "Another brand ad",
    "video_url": "/videos/brand_ad_2.mp4",
    "brand_id": "67890",
    "duration": 45,
    "active": true
  }
]
```

## Usage Example

1. **Navigate to ads page**: `/ads/MACHINE_001`
2. **MQTT handler registers**: Custom handler for machine code "MACHINE_001" is registered
3. **Product purchase occurs**: MQTT message is sent when product is dispensed
4. **Playlist switches**: System fetches brand ads and switches to brand-specific playlist
5. **Videos loop**: Brand videos play in rotation until another product is purchased or page is closed

## Testing

To test the integration:

1. Open the ads page: `http://localhost:3000/ads/MACHINE_001`
2. Send an MQTT message to test the integration:

```javascript
// Using MQTT.js in browser console or testing tool
const message = {
  machine_code: "MACHINE_001",
  product_id: "12345"
};

// Publish to MQTT broker
client.publish('scentral/advertising/state', JSON.stringify(message));
```

3. Check browser console for logs showing:
   - MQTT handler registration
   - Message reception
   - Product brand fetching
   - Playlist switching

## Error Handling

- If product is not found, the current playlist continues
- If brand has no advertisements, the current playlist continues
- If API endpoints are unavailable, error messages are shown in the status indicator
- All errors are logged to the browser console for debugging

## Status Indicators

The ads page shows status messages for:
- MQTT handler registration
- Product dispensed notifications
- Playlist switching confirmations
- Error messages

These messages appear temporarily in the top-left corner of the video player.