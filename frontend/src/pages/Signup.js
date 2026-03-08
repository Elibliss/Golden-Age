import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { isValidEmail, isValidName, isValidPassword } from '../utils';

export default function Signup(){
  const [form, setForm] = useState({ email:'', password:'', confirmPassword:'', name:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  async function submit(e){
    e.preventDefault();
    setErr('');
    
    // Validation
    const trimmedName = (form.name || '').trim();
    const trimmedEmail = (form.email || '').trim();
    
    if (!trimmedName || !trimmedEmail || !form.password || !form.confirmPassword) {
      setErr('Please fill in all fields');
      return;
    }
    
    if (!isValidName(form.name)) {
      setErr('Name must be at least 2 characters');
      return;
    }
    
    if (!isValidEmail(trimmedEmail)) {
      setErr('Please enter a valid email address');
      return;
    }
    
    if (!isValidPassword(form.password)) {
      setErr('Password must be at least 6 characters');
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setErr('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try{
      const r = await axios.post('/api/auth/signup', { 
        email: trimmedEmail, 
        password: form.password, 
        name: trimmedName 
      });
      localStorage.setItem('token', r.data.token);
      const to = localStorage.getItem('post_login_redirect') || '/';
      localStorage.removeItem('post_login_redirect');
      navigate(to);
    }catch(err){ 
      const errorMsg = err.response?.data?.error || 'Signup failed. Please try again.';
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join us and start your journey</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Enter your name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Enter your email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" type="password" placeholder="Create a strong password (min 6 chars)" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={e=>setForm({...form, confirmPassword:e.target.value})} />
            </div>
            {err && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{err}</div>}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-semibold">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
