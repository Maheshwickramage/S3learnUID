import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, ShoppingCart, Activity, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState(null);

  const stats = [
    {
      id: 1,
      title: 'Total Revenue',
      value: '$45,231',
      change: '+20.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 2,
      title: 'Active Users',
      value: '2,845',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 3,
      title: 'Total Orders',
      value: '1,234',
      change: '-5.2%',
      trend: 'down',
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 4,
      title: 'Growth Rate',
      value: '89.2%',
      change: '+8.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600'
    }
  ];

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Made a purchase', amount: '$234', time: '2 min ago', status: 'success' },
    { id: 2, user: 'Sarah Smith', action: 'New registration', amount: '-', time: '5 min ago', status: 'info' },
    { id: 3, user: 'Mike Johnson', action: 'Refund requested', amount: '$89', time: '12 min ago', status: 'warning' },
    { id: 4, user: 'Emma Wilson', action: 'Made a purchase', amount: '$456', time: '18 min ago', status: 'success' },
    { id: 5, user: 'David Brown', action: 'Updated profile', amount: '-', time: '25 min ago', status: 'info' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
            <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex gap-2">
            {['day', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
            return (
              <div
                key={stat.id}
                onClick={() => setSelectedMetric(stat.id === selectedMetric ? null : stat.id)}
                className={`bg-gray-900 rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                  selectedMetric === stat.id
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 scale-105'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    <TrendIcon size={14} />
                    {stat.change}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart Placeholder */}
          <div className="lg:col-span-2 bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Revenue Overview</h2>
              <Activity className="text-gray-500" size={20} />
            </div>
            
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-64 gap-2">
              {[65, 45, 78, 52, 88, 42, 95, 62, 73, 58, 82, 90].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-emerald-400' :
                    activity.status === 'warning' ? 'bg-amber-400' :
                    'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{activity.user}</p>
                    <p className="text-gray-400 text-xs">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{activity.amount}</p>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Quick Actions */}
        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to boost your sales?</h3>
              <p className="text-indigo-100">Upgrade to Pro and unlock advanced analytics features.</p>
            </div>
            <button className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
