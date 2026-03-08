import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSecret(){
  const [key, setKey] = useState('');
  const navigate = useNavigate();
  function submit(e){
    e.preventDefault();
    if (!key) return;
    localStorage.setItem('admin_token', key);
    navigate('/admin');
  }
  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
      <form onSubmit={submit} className="card p-6">
        <input className="input" placeholder="Admin key" value={key} onChange={e=>setKey(e.target.value)} />
        <div className="mt-4 text-right">
          <button type="submit" className="btn-primary px-4 py-2">Enter</button>
        </div>
      </form>
      <div className="text-xs text-gray-500 mt-2 text-center">Keep this link secret.</div>
    </div>
  );
}
