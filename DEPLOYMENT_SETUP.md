# GitHub Actions Deployment to AWS EC2 - Step by Step Guide

## Overview
This guide will help you set up automatic deployment from GitHub to AWS EC2 using Docker.

---

## Part 1: AWS EC2 Setup

### Step 1: Launch EC2 Instance

1. **Login to AWS Console**
   - Go to https://aws.amazon.com/console/
   - Navigate to EC2 Dashboard

2. **Launch Instance**
   - Click "Launch Instance"
   - **Name**: `s3learn-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: t2.micro (Free tier) or t3.small (Recommended for production)
   - **Key Pair**: Create new key pair
     - Name: `s3learn-key`
     - Type: RSA
     - Format: .pem
     - **IMPORTANT**: Download and save this file securely!

3. **Configure Security Group**
   - Click "Edit" in Network Settings
   - Add these inbound rules:
     ```
     SSH     | TCP | 22   | Your IP (for setup) or 0.0.0.0/0
     HTTP    | TCP | 80   | 0.0.0.0/0
     HTTPS   | TCP | 443  | 0.0.0.0/0
     Custom  | TCP | 3000 | 0.0.0.0/0 (API - optional if using nginx)
     ```

4. **Launch Instance**
   - Click "Launch Instance"
   - Wait for instance state to be "Running"
   - Note down the **Public IPv4 address**

---

### Step 2: Connect to EC2 Instance

```bash
# On your local machine
chmod 400 ~/Downloads/s3learn-key.pem
ssh -i ~/Downloads/s3learn-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

### Step 3: Install Docker on EC2

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group (so you don't need sudo)
sudo usermod -aG docker ubuntu
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

---

### Step 4: Install Git and Clone Repository

```bash
# Install Git
sudo apt install git -y

# Configure Git (use your GitHub email and name)
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"

# Create directory and clone your repo
cd ~
git clone https://github.com/Maheshwickramage/S3learnUID.git s3learn
cd s3learn
```

---

### Step 5: Setup SSH for GitHub (for pulling updates)

```bash
# Generate SSH key on EC2
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for all prompts (use default location)

# Display the public key
cat ~/.ssh/id_ed25519.pub
```

**Copy this public key**, then:
1. Go to GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste the key and save

**Test connection:**
```bash
ssh -T git@github.com
# Should say: "Hi username! You've successfully authenticated"
```

**Update remote URL to use SSH:**
```bash
cd ~/s3learn
git remote set-url origin git@github.com:Maheshwickramage/S3learnUID.git
```

---

### Step 6: First Deployment (Manual)

```bash
cd ~/s3learn

# Build and start containers
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

**Test in browser**: `http://YOUR_EC2_PUBLIC_IP`

---

## Part 2: GitHub Setup

### Step 1: Get Your SSH Private Key Content

On your **local machine** (not EC2):
```bash
cat ~/Downloads/s3learn-key.pem
```

Copy the **entire content** including:
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

---

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/Maheshwickramage/S3learnUID

2. Click **Settings** → **Secrets and variables** → **Actions**

3. Click **New repository secret** and add these three secrets:

   **Secret 1:**
   - Name: `EC2_HOST`
   - Value: Your EC2 Public IP (e.g., `54.123.45.67`)

   **Secret 2:**
   - Name: `EC2_USER`
   - Value: `ubuntu`

   **Secret 3:**
   - Name: `EC2_SSH_KEY`
   - Value: Paste the entire content of your .pem file

4. Click **Add secret** for each one

---

### Step 3: Push the Workflow File

The workflow file is already created at `.github/workflows/deploy.yml`

Just commit and push:

```bash
git add .
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

---

## Part 3: Test the Deployment

### Step 1: Make a Test Change

```bash
# Make any small change to test
echo "# Test deployment" >> README.md
git add .
git commit -m "Test automatic deployment"
git push origin main
```

### Step 2: Watch the Deployment

1. Go to GitHub → **Actions** tab
2. You'll see your workflow running
3. Click on it to see real-time logs
4. Wait for it to complete (green checkmark ✅)

### Step 3: Verify on EC2

```bash
# SSH to EC2
ssh -i ~/Downloads/s3learn-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f server
```

**Visit your site**: `http://YOUR_EC2_PUBLIC_IP`

---

## Part 4: Setup Domain (Optional)

### If you have a domain:

1. **Point domain to EC2**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add A record: `yourdomain.com` → Your EC2 Public IP
   - Add A record: `www.yourdomain.com` → Your EC2 Public IP

2. **Install Nginx on EC2**
   ```bash
   ssh -i ~/Downloads/s3learn-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   sudo apt install nginx -y
   ```

3. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/s3learn
   ```

   Paste this:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:80;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           client_max_body_size 100M;
       }
   }
   ```

   Enable it:
   ```bash
   sudo ln -s /etc/nginx/sites-available/s3learn /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Setup SSL (Free with Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## Troubleshooting

### Deployment fails with "Permission denied"
- Check if EC2_SSH_KEY secret contains the complete .pem file
- Verify EC2_HOST and EC2_USER are correct

### Can't connect to EC2
- Check Security Group allows SSH (port 22) from 0.0.0.0/0
- Verify the EC2 instance is running
- Check you're using the correct IP address

### Docker containers not starting
```bash
# SSH to EC2 and check logs
ssh -i ~/Downloads/s3learn-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
cd ~/s3learn
docker-compose logs
```

### Website not accessible
- Check EC2 Security Group allows HTTP (port 80)
- Verify containers are running: `docker-compose ps`
- Check if port 80 is in use: `sudo lsof -i :80`

### MongoDB connection issues
- Your MongoDB Atlas connection string is already in docker-compose.yml
- Verify MongoDB Atlas allows connections from your EC2 IP:
  1. Go to MongoDB Atlas → Network Access
  2. Add IP Address → Add your EC2 Public IP or use 0.0.0.0/0

---

## Important Notes

1. **Keep your .pem file safe** - Never commit it to GitHub!
2. **Security Group** - Restrict SSH to your IP after setup for security
3. **Backups** - Consider setting up automated MongoDB backups
4. **Monitoring** - Check CloudWatch for EC2 metrics
5. **Costs** - Free tier covers t2.micro, but monitor your usage

---

## Cost Estimate (AWS Free Tier)

- **EC2 t2.micro**: Free for 750 hours/month (first 12 months)
- **Data Transfer**: 15 GB/month outbound (free)
- **After free tier**: ~$8-10/month for t2.micro

For better performance: **t3.small** costs ~$15/month

---

## Summary of What Happens

1. You push code to GitHub main branch
2. GitHub Actions workflow triggers automatically
3. Workflow connects to your EC2 instance via SSH
4. Pulls latest code from GitHub
5. Rebuilds Docker containers
6. Restarts the application
7. Your site is updated! 🎉

**Total setup time**: 30-45 minutes

---

## Quick Reference Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Rebuild after changes
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# SSH to EC2
ssh -i ~/Downloads/s3learn-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Check disk space
df -h

# Check memory usage
free -h
```
