# 🚀 S3Learn - Creator Platform for React Components

A community-driven platform where creators can share React UI components, earn recognition, and unlock rewards based on downloads and engagement.

## ✨ Features

### For Creators
- 📦 **Upload Components** - Share your React components with the community
- 📊 **Track Stats** - Monitor downloads, views, and engagement
- 🎯 **Milestone Rewards** - Unlock badges and rewards at 100, 500, 1000, 5000 downloads
- 🏆 **Level System** - Earn points and level up as a creator
- 👁️ **Interactive Demos** - Add live CodeSandbox/StackBlitz demos for users to try

### For Users
- 🔍 **Browse & Search** - Find components by category, name, or tags
- 👀 **Preview Components** - View static previews or interactive live demos
- ⬇️ **Download** - Get ready-to-use React components
- 🌟 **Rate & Review** - Help creators improve their components

## 🎮 Gamification System

### Points & Levels
- **+10 points** for each component upload
- **+1 point** for each download
- **Level up** every 100 points

### Badges
- 🌱 **Rookie** - First component upload
- 📦 **Contributor** - Active creator
- ⭐ **Star** - Popular components
- 👑 **Legend** - Elite creator status

### Milestone Rewards
| Downloads | Reward | Description |
|-----------|--------|-------------|
| 100 | Rising Star 🌟 | Special badge & recognition |
| 500 | Featured Creator ⭐ | Components get featured placement |
| 1,000 | Master Creator 🏆 | Digital certificate of excellence |
| 5,000 | Legend Status 👑 | Exclusive gift package |

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Lucide Icons

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- bcrypt (password hashing)

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd s3learn
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**

Create `server/.env`:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
ADMIN_SECRET_KEY=your_admin_key
MAX_FILE_SIZE=52428800
```

5. **Seed the database (optional)**
```bash
cd server
npm run seed
```

## 🚀 Running the Application

### Start Backend
```bash
cd server
node server.js
```
Server runs on `http://localhost:5001`

### Start Frontend
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

## 📝 API Documentation

### Authentication Endpoints

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Profile**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Get Stats**
```http
GET /api/auth/stats
Authorization: Bearer <token>
```

### Component Endpoints

**Get All Components**
```http
GET /api/components?category=Dashboard&search=admin&sort=popular
```

**Upload Component**
```http
POST /api/admin/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
  - name: string
  - category: string
  - description: string
  - tags: string (comma-separated)
  - demoUrl: string (optional)
  - zipFile: file
  - previewImage: file
```

**Download Component**
```http
GET /api/components/download/:id
```

## 🎨 Creating Interactive Demos

To provide the best experience for users, add live demos to your components:

### Option 1: CodeSandbox
1. Create a new React sandbox on [CodeSandbox](https://codesandbox.io)
2. Add your component
3. Copy the embed URL (e.g., `https://codesandbox.io/embed/abc123`)
4. Paste in the "Demo URL" field when uploading

### Option 2: StackBlitz
1. Create a React project on [StackBlitz](https://stackblitz.com)
2. Add your component
3. Copy the embed URL
4. Paste in the "Demo URL" field when uploading

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 🙏 Acknowledgments

- Thanks to all creators who share their components
- Built with ❤️ for the React community

## 📧 Contact

For questions or support, reach out to: [your-email@example.com]

---

**Happy Creating! 🎨✨**
