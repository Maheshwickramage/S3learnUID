# 📊 Admin Dashboard Component

A beautiful, interactive admin dashboard built with React and Tailwind CSS. Features real-time stats, revenue charts, and activity tracking.

## ✨ Features

- 📈 **Live Statistics Cards** - Revenue, users, orders, growth rate
- 📊 **Interactive Charts** - Visual revenue overview with monthly data
- 🔔 **Activity Feed** - Real-time user activity tracking
- 🎨 **Modern UI** - Dark theme with gradient accents
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Interactive Elements** - Click stats to highlight, hover effects

## 🚀 Installation

```bash
npm install react react-dom lucide-react
# or
yarn add react react-dom lucide-react
```

## 📦 Usage

### Basic Implementation

```jsx
import AdminDashboard from './AdminDashboard';

function App() {
  return <AdminDashboard />;
}
```

### With Tailwind CSS

Make sure you have Tailwind CSS configured in your project:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add to your `tailwind.config.js`:

```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 🎨 Customization

### Change Color Scheme

The dashboard uses gradient colors that you can customize:

```jsx
// In AdminDashboard.jsx, modify the stats array:
const stats = [
  {
    // ... other properties
    color: 'from-emerald-500 to-teal-600' // Change this
  }
];
```

### Add Your Own Data

Replace the mock data with real API calls:

```jsx
const [stats, setStats] = useState([]);

useEffect(() => {
  fetch('/api/dashboard/stats')
    .then(res => res.json())
    .then(data => setStats(data));
}, []);
```

## 📊 Components Breakdown

- **Stats Cards**: Clickable metric cards with trend indicators
- **Revenue Chart**: Bar chart showing monthly performance
- **Activity Feed**: Real-time user actions and events
- **CTA Banner**: Promotional section for upgrades

## 🎯 Use Cases

- Admin panels
- SaaS dashboards
- E-commerce analytics
- Business intelligence tools
- Internal reporting systems

## 📱 Responsive Design

The dashboard is fully responsive:
- **Desktop**: 4-column grid for stats, 2-column layout for charts
- **Tablet**: 2-column grid, stacked layout
- **Mobile**: Single column, optimized touch targets

## 🔧 Dependencies

- `react`: ^18.0.0
- `react-dom`: ^18.0.0
- `lucide-react`: ^0.263.0
- `tailwindcss`: ^3.0.0

## 📄 License

MIT - Free to use in personal and commercial projects

## 🤝 Contributing

Feel free to customize and extend this component for your needs!

---

Built with ❤️ for S3Learn
