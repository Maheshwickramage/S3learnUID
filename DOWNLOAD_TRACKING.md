# Download Tracking System

## Overview
The platform now includes a comprehensive download tracking system to prevent duplicate counting and ensure accurate reward distribution.

## How It Works

### 1. Unique Download Detection
- **Logged-in Users**: Tracked by User ID (one download per component per user)
- **Anonymous Users**: Tracked by browser fingerprint (canvas + device characteristics)

### 2. Browser Fingerprinting
Anonymous users are identified using:
- Canvas rendering signature
- Screen resolution & color depth
- Timezone
- Language & Platform
- Hardware specs (CPU cores, memory)

### 3. Database Schema

**Download Model** (`models/Download.js`):
```javascript
{
  component: ObjectId,        // Reference to component
  user: ObjectId,            // User ID (if logged in)
  fingerprint: String,       // Browser fingerprint (if anonymous)
  ipAddress: String,         // For additional tracking
  userAgent: String,         // Browser info
  downloadedAt: Date         // Timestamp
}
```

**Indexes**:
- `{ component: 1, user: 1 }` - Unique constraint for logged-in users
- `{ component: 1, fingerprint: 1 }` - For anonymous user checks

### 4. Download Flow

#### Client Side (`client/src/App.jsx`):
```javascript
const handleDownload = async (component) => {
  // 1. Track the download (checks for duplicates)
  const result = await api.trackDownload(component._id, token);
  
  // 2. If already downloaded, show message
  if (result.alreadyDownloaded) {
    alert('You have already downloaded this component');
  }
  
  // 3. Open S3 URL in new tab
  window.open(component.zipUrl, '_blank');
  
  // 4. Refresh to show updated counts
  fetchData();
};
```

#### API Endpoint (`routes/components.js`):
```
POST /api/components/track-download/:id
```

**Process**:
1. Check if user/fingerprint already downloaded this component
2. If duplicate: Return `alreadyDownloaded: true` (still allows download)
3. If unique: 
   - Create Download record
   - Increment component.downloads
   - Update creator.totalDownloads
   - Check for milestone rewards (100, 500, 1000, 5000)
   - Award rewards automatically

### 5. Reward Milestones

Creators automatically receive rewards when reaching download milestones:

| Downloads | Reward | Type |
|-----------|--------|------|
| 100 | Rising Star 🌟 | Badge & Recognition |
| 500 | Featured Creator ⭐ | Component Feature |
| 1000 | Master Creator 🏆 | Digital Certificate |
| 5000 | Legend Status 👑 | Gift Package |

### 6. Statistics

**Component Downloads**:
- `component.downloads` = Unique downloads only
- Duplicates are tracked but don't increment counter

**Creator Stats**:
- `creator.totalDownloads` = Sum of all unique downloads
- `creator.points` = +1 per unique download
- `creator.rewards[]` = Array of earned milestone rewards

## API Changes

### New Endpoint
```javascript
POST /api/components/track-download/:id
Headers: Authorization: Bearer <token> (optional)
Body: { fingerprint: string }

Response:
{
  success: true,
  alreadyDownloaded: false,
  message: "Download tracked successfully",
  zipUrl: "https://bucket.s3.amazonaws.com/zips/file.zip",
  uniqueDownloads: 42
}
```

### Updated Client API (`services/api.js`)
```javascript
// New methods:
api.trackDownload(componentId, token)
api.generateFingerprint()  // Internal browser fingerprinting
```

## Benefits

1. **Accurate Metrics**: Only unique downloads counted
2. **Fair Rewards**: Creators can't game the system
3. **User Tracking**: Works for both logged-in and anonymous users
4. **Analytics Ready**: Download records include timestamp, IP, user agent
5. **Duplicate Detection**: Users notified if already downloaded
6. **Automatic Rewards**: Milestone rewards granted instantly

## Testing

### Test Duplicate Detection:
1. Download a component
2. Try to download the same component again
3. Should see "already downloaded" message
4. Download count should not increase

### Test Milestone Rewards:
1. Upload components as creator
2. Have users download to reach milestones
3. Check `/api/auth/me` to see `rewards` array
4. Dashboard should show earned badges

## Database Queries

**Get download history for a user**:
```javascript
Download.find({ user: userId })
  .populate('component', 'name slug')
  .sort({ downloadedAt: -1 });
```

**Get unique downloaders for a component**:
```javascript
Download.countDocuments({ component: componentId });
```

**Get creator's top components**:
```javascript
Component.find({ creator: userId })
  .sort({ downloads: -1 })
  .limit(5);
```

## Privacy Notes

- Fingerprints are hashed and not personally identifiable
- IP addresses stored for security/analytics only
- User IDs used only if user is logged in
- Anonymous tracking is privacy-respecting (no cookies, no personal data)

## Future Enhancements

- [ ] Download analytics dashboard
- [ ] Geographic download distribution
- [ ] Time-series download charts
- [ ] Export download history
- [ ] Download speed tracking
- [ ] Referrer tracking
