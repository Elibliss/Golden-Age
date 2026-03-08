import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AdminLogin(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e){
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const r = await api.post('/api/admin/login', { username, password });
      localStorage.setItem('admin_session', r.data.session);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block text-white">
          <h1 className="text-5xl font-bold mb-4">Golden Age</h1>
          <p className="text-xl text-blue-100 mb-6">Premium Food & Event Services</p>
          <ul className="space-y-3 text-blue-100">
            <li className="flex items-center gap-2">
              <span>Manage Products & Menu</span>
            </li>
            <li className="flex items-center gap-2">
              <span>Track Orders & Delivery</span>
            </li>
            <li className="flex items-center gap-2">
              <span>Handle Event Bookings</span>
            </li>
            <li className="flex items-center gap-2">
              <span>View Analytics & Reports</span>
            </li>
          </ul>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Admin Portal</h2>
            <p className="text-gray-600 mt-2">Manage your business</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Username</label>
              <input 
                type="text"
                className="w-full px-10 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-gray-900"
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <input 
                type="password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-gray-900"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm">
                <p className="font-semibold">Login Failed</p>
                <p>{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-6 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin">⏳</span>
                  Logging in...
                </span>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-gray-800 mb-3">📝 Demo Credentials</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Username:</span>
                <code className="bg-white border border-gray-300 px-3 py-1 rounded font-mono text-sm text-blue-600">admin</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Password:</span>
                <code className="bg-white border border-gray-300 px-3 py-1 rounded font-mono text-sm text-blue-600">admin123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
     
}
