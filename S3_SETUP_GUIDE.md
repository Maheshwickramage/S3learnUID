# AWS S3 Integration Guide

## Setup Steps

### 1. Create S3 Bucket

1. **Login to AWS Console**: https://console.aws.amazon.com/s3/
2. **Create Bucket**:
   - Click "Create bucket"
   - **Bucket name**: `s3learn-uploads` (must be globally unique)
   - **Region**: Choose your preferred region (e.g., `us-east-1`)
   - **Block Public Access**: Uncheck "Block all public access" (we need public read access for images/videos)
   - **Bucket Versioning**: Optional (recommended for backup)
   - Click "Create bucket"

3. **Set Bucket Policy** (for public read access):
   - Go to your bucket → Permissions → Bucket Policy
   - Add this policy (replace `YOUR_BUCKET_NAME`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

4. **Enable CORS** (for browser uploads):
   - Go to Permissions → CORS
   - Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 2. Create IAM User

1. **Go to IAM**: https://console.aws.amazon.com/iam/
2. **Create User**:
   - Click "Users" → "Add users"
   - **User name**: `s3learn-uploader`
   - **Access type**: Programmatic access
   - Click "Next"

3. **Set Permissions**:
   - Select "Attach existing policies directly"
   - Search and attach: `AmazonS3FullAccess` (or create custom policy below)
   - Click "Next" → "Create user"

4. **Save Credentials**:
   - **IMPORTANT**: Copy the Access Key ID and Secret Access Key
   - You won't be able to see the secret key again!

**Custom Policy (More Secure - Recommended)**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR_BUCKET_NAME",
                "arn:aws:s3:::YOUR_BUCKET_NAME/*"
            ]
        }
    ]
}
```

### 3. Update Environment Variables

Update your `.env` file:

```env
USE_S3=true
AWS_ACCESS_KEY_ID=AKIA...your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=s3learn-uploads
```

### 4. Update Docker Compose

Add AWS credentials to `docker-compose.yml`:

```yaml
services:
  server:
    environment:
      - USE_S3=true
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_REGION=${AWS_REGION}
      - S3_BUCKET_NAME=${S3_BUCKET_NAME}
```

### 5. Install Dependencies

```bash
cd server
npm install
```

### 6. Deploy

**Local Testing:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Production (EC2):**
```bash
# Update .env on EC2 with your AWS credentials
nano ~/s3learn/.env

# Add these lines:
USE_S3=true
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=s3learn-uploads

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

Or add to GitHub Secrets for automatic deployment:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`

## How It Works

### File Structure in S3:
```
s3learn-uploads/
├── previews/
│   ├── 1733068800000-123456789.png
│   └── 1733068900000-987654321.jpg
├── videos/
│   ├── 1733068800000-111111111.mp4
│   └── 1733068900000-222222222.mov
└── zips/
    ├── 1733068800000-333333333.zip
    └── 1733068900000-444444444.zip
```

### URLs Generated:
- **Preview Image**: `https://s3learn-uploads.s3.us-east-1.amazonaws.com/previews/1733068800000-123456789.png`
- **Video**: `https://s3learn-uploads.s3.us-east-1.amazonaws.com/videos/1733068800000-111111111.mp4`
- **ZIP**: `https://s3learn-uploads.s3.us-east-1.amazonaws.com/zips/1733068800000-333333333.zip`

## Benefits of S3

✅ **Scalable**: No disk space limits on your EC2 instance
✅ **Fast**: CDN-like delivery worldwide
✅ **Reliable**: 99.999999999% durability
✅ **Cost-effective**: Pay only for what you use
✅ **No Volume Mounts**: Docker containers don't need persistent storage

## Cost Estimate

- **Storage**: $0.023 per GB/month
- **Requests**: $0.005 per 1,000 PUT requests, $0.0004 per 1,000 GET requests
- **Transfer**: First 1 GB/month free, then $0.09/GB

**Example**: 100 GB storage + 10,000 uploads/month + 100,000 downloads/month = ~$5/month

## Testing

After setup, upload a component and check:

1. **Component uploaded successfully**
2. **Image displays in browser**
3. **Video plays correctly**
4. **ZIP file downloads**

Check S3 bucket to verify files were uploaded:
```bash
aws s3 ls s3://s3learn-uploads/previews/
aws s3 ls s3://s3learn-uploads/videos/
aws s3 ls s3://s3learn-uploads/zips/
```

## Troubleshooting

### Files not uploading
- Check AWS credentials are correct
- Verify IAM user has S3 permissions
- Check bucket name matches `.env`

### Images not displaying
- Verify bucket policy allows public read
- Check CORS configuration
- Ensure bucket name is correct in URLs

### Access Denied errors
- Review IAM policy permissions
- Check bucket policy
- Verify AWS_REGION matches bucket region

## Rollback to Local Storage

To switch back to local storage:

```env
USE_S3=false
```

Then rebuild containers. Existing S3 files will remain accessible.
