import React, { useState } from 'react';
import { X, Gift, Package, Award, Crown } from 'lucide-react';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
  'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic',
  'Ireland', 'Portugal', 'Greece', 'Japan', 'South Korea', 'Singapore',
  'India', 'Sri Lanka', 'Malaysia', 'Thailand', 'New Zealand', 'Other'
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const getRewardIcon = (type) => {
  switch(type) {
    case 't-shirt': return <Package className="text-purple-400" size={48} />;
    case 'cap': return <Gift className="text-blue-400" size={48} />;
    case 'certificate': return <Award className="text-yellow-400" size={48} />;
    case 'gift-package': return <Crown className="text-pink-400" size={48} />;
    default: return <Gift className="text-indigo-400" size={48} />;
  }
};

const getRewardDescription = (type, milestone) => {
  switch(type) {
    case 't-shirt':
      return 'Congratulations! You\'ve earned a premium S3Learn branded t-shirt!';
    case 'cap':
      return 'Amazing work! You\'ve earned a stylish S3Learn cap!';
    case 'certificate':
      return 'Incredible achievement! You\'ve earned a digital certificate of excellence!';
    case 'gift-package':
      return 'Legendary! You\'ve earned an exclusive S3Learn gift package!';
    default:
      return 'Congratulations on reaching this milestone!';
  }
};

const needsShipping = (type) => {
  return ['t-shirt', 'cap', 'gift-package'].includes(type);
};

const needsSize = (type) => {
  return ['t-shirt', 'cap'].includes(type);
};

export default function RewardPopup({ reward, onClose, onSubmit }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    size: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (needsSize(reward.type) && !formData.size) newErrors.size = 'Size is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {!showForm ? (
          // Congratulations Screen
          <div className="p-8 text-center">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
              <X size={24} />
            </button>
            
            <div className="mb-6 animate-bounce-slow">
              {getRewardIcon(reward.type)}
            </div>
            
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              🎉 Congratulations! 🎉
            </h2>
            
            <h3 className="text-2xl font-bold text-white mb-3">
              {reward.title}
            </h3>
            
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 mb-6 border border-indigo-500/30">
              <p className="text-xl text-gray-200 mb-2">
                {getRewardDescription(reward.type, reward.milestone)}
              </p>
              <p className="text-gray-400">
                You've reached <span className="text-yellow-400 font-bold">{reward.milestone}</span> total downloads!
              </p>
            </div>

            {needsShipping(reward.type) ? (
              <div className="space-y-4">
                <p className="text-gray-300">
                  To receive your reward, please provide your shipping details.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white font-bold text-lg hover:opacity-90 transition transform hover:scale-105"
                >
                  Claim Your Reward
                </button>
                <button
                  onClick={onClose}
                  className="block w-full text-gray-400 hover:text-white transition"
                >
                  I'll claim it later
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white font-bold text-lg hover:opacity-90 transition"
              >
                Awesome!
              </button>
            )}
          </div>
        ) : (
          // Shipping Form
          <div className="p-8">
            <button onClick={() => setShowForm(false)} className="absolute top-4 left-4 text-gray-400 hover:text-white transition">
              ← Back
            </button>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6 text-center mt-4">
              Shipping Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.fullName ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-indigo-500`}
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-indigo-500`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-gray-800 border ${errors.phone ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-indigo-500`}
                    placeholder="+1 234 567 8900"
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.addressLine1 ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-indigo-500`}
                  placeholder="123 Main Street"
                />
                {errors.addressLine1 && <p className="text-red-400 text-sm mt-1">{errors.addressLine1}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-gray-800 border ${errors.city ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-indigo-500`}
                    placeholder="New York"
                  />
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-gray-800 border ${errors.postalCode ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-indigo-500`}
                    placeholder="10001"
                  />
                  {errors.postalCode && <p className="text-red-400 text-sm mt-1">{errors.postalCode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country *</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.country ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-indigo-500`}
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
              </div>

              {needsSize(reward.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Size *</label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {SIZES.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, size }))}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          formData.size === size
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {errors.size && <p className="text-red-400 text-sm mt-1">{errors.size}</p>}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white font-bold hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Shipping Information'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
