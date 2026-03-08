import React, { useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { isValidEmail } from '../utils';

export default function Login(){
  const [form, setForm] = useState({ email:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  async function submit(e){
    e.preventDefault();
    setErr('');
    
    // Validation
    if (!form.email.trim() || !form.password.trim()) {
      setErr('Please fill in all fields');
      return;
    }
    
    if (!isValidEmail(form.email)) {
      setErr('Please enter a valid email address');
      return;
    }
    
    if (form.password.length < 6) {
      setErr('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try{
      const r = await api.post('/api/auth/login', { email: form.email.trim(), password: form.password });
      localStorage.setItem('token', r.data.token);
      const to = localStorage.getItem('post_login_redirect') || '/';
      localStorage.removeItem('post_login_redirect');
      navigate(to);
    }catch(error){ 
      const errorMsg = error.response?.data?.error || 'Invalid credentials. Please try again.';
      setErr(errorMsg);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Enter your email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" type="password" placeholder="Enter your password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
            </div>
            {err && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{err}</div>}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline font-semibold">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
