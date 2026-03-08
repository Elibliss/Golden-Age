import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';

export default function Admin(){
  const navigate = useNavigate();
  const [session, setSession] = useState(localStorage.getItem('admin_session'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_buyers: 0 });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [reply, setReply] = useState({ id:null, to:'', message:'' });
  const [prod, setProd] = useState({ name:'', price:'', description:'', category:'', is_popular:false });
  const [prodImg, setProdImg] = useState(null);
  const [prodMsg, setProdMsg] = useState('');
  const [prodError, setProdError] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(()=>{
    if (!session) {
      navigate('/admin-login');
      return;
    }
    fetchData();
  },[session]);

  async function fetchData(){
    try {
      const headers = { 'x-admin-session': session };
      const [ordersRes, eventsRes, productsRes, statsRes, usersRes] = await Promise.all([
        axios.get('/api/orders', { headers }),
        axios.get('/api/events', { headers }),
        axios.get('/api/products', { headers }),
        axios.get('/api/admin/stats', { headers }),
        axios.get('/api/admin/users', { headers })
      ]);
      setOrders(ordersRes.data);
      setEvents(eventsRes.data);
      setProducts(productsRes.data);
      setStats(statsRes.data || { total_users: 0, total_buyers: 0 });
      setUsers(usersRes.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('admin_session');
        navigate('/admin-login');
      }
    }
  }

  function logout(){
    localStorage.removeItem('admin_session');
    navigate('/admin-login');
  }

  async function setOrderStatus(id, status){
    try{
      const headers = { 'x-admin-session': session };
      const r = await axios.post(`/api/orders/${id}/status`, { status }, { headers });
      setOrders(prev => prev.map(o=> o.id===id ? r.data.order : o));
    }catch(err) { console.error(err); }
  }

  async function sendReply(){
    if (!reply.id) return;
    try{
      const headers = { 'x-admin-session': session };
      await axios.post(`/api/events/${reply.id}/reply`, { message: reply.message, to: reply.to }, { headers });
      setReply({ id:null, to:'', message:'' });
      await fetchData();
    }catch(err) { console.error(err); }
  }

  async function addProduct(e){
    e.preventDefault();
    setProdError({});
    
    // Validation
    const errors = {};
    const name = (prod.name || '').trim();
    const price = prod.price ? parseFloat(prod.price) : null;
    const category = (prod.category || '').trim();
    const description = (prod.description || '').trim();
    
    if (!name) {
      errors.name = 'Product name is required';
    } else if (name.length < 3) {
      errors.name = 'Product name must be at least 3 characters';
    }
    
    if (!price) {
      errors.price = 'Price is required';
    } else if (isNaN(price) || price <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    if (!category) {
      errors.category = 'Category is required';
    }
    
    if (!description) {
      errors.description = 'Description is required';
    } else if (description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (Object.keys(errors).length > 0) {
      setProdError(errors);
      return;
    }
    
    try{
      const fd = new FormData();
      fd.append('name', name);
      fd.append('price', String(price));
      fd.append('description', description);
      fd.append('category', category);
      fd.append('is_popular', prod.is_popular ? 'true' : 'false');
      if (prodImg) fd.append('image', prodImg);
      const headers = { 'x-admin-session': session };
      await axios.post('/api/products', fd, { headers });
      setProd({ name:'', price:'', description:'', category:'', is_popular:false });
      setProdImg(null);
      setProdMsg('Product added ✓');
      setTimeout(()=>setProdMsg(''), 2500);
      await fetchData();
    }catch(err){
      console.error('Product error:', err.response?.data || err.message);
      setProdMsg(err.response?.data?.error || 'Failed to add product');
      setTimeout(()=>setProdMsg(''), 2500);
    }
  }

  async function deleteProduct(id){
    try{
      const headers = { 'x-admin-session': session };
      await axios.delete(`/api/products/${id}`, { headers });
      setProdMsg('Product deleted ✓');
      setTimeout(()=>setProdMsg(''), 2500);
      setDeleteConfirmId(null);
      await fetchData();
    }catch(err){
      console.error('Delete error:', err.response?.data || err.message);
      setProdMsg('Failed to delete product');
      setTimeout(()=>setProdMsg(''), 2500);
    }
  }

  function handleLogout() {
    setShowLogoutModal(true);
  }

  function confirmLogout() {
    setShowLogoutModal(false);
    logout();
  }

  return (
    <div className="flex bg-gray-100 min-h-screen w-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Golden Age</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
        </div>
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            📊 Dashboard
          </button>
          <button onClick={()=>setActiveTab('orders')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'orders' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            📦 Orders
          </button>
          <button onClick={()=>setActiveTab('events')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'events' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            📅 Events
          </button>
          <button onClick={()=>setActiveTab('products')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'products' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            🍽️ Products
          </button>
          <button onClick={()=>setActiveTab('users')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            👥 Users
          </button>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Total Orders</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">{orders.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Event Inquiries</div>
                <div className="text-3xl font-bold text-green-600 mt-2">{events.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Products</div>
                <div className="text-3xl font-bold text-orange-600 mt-2">{products.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Total Users</div>
                <div className="text-3xl font-bold text-indigo-600 mt-2">{stats.total_users}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Buyers</div>
                <div className="text-3xl font-bold text-cyan-600 mt-2">{stats.total_buyers}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Revenue</div>
                <div className="text-2xl font-bold text-purple-600 mt-2">₦{orders.reduce((sum, o) => sum + (o.items || []).reduce((s, i) => s + (i.price * i.qty), 0), 0).toLocaleString()}</div>
              </div>
            </div>
            
            {/* Recent Users Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Users</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.slice(0, 5).map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">#{u.id}</td>
                          <td className="px-6 py-3 text-sm text-gray-900">{u.name || 'N/A'}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-600">
                  Showing {Math.min(5, users.length)} of {users.length} users
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Orders</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Items</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map(o => (
                      <React.Fragment key={o.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">#{o.id}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{(o.items || []).length} items</td>
                          <td className="px-6 py-3 text-sm font-semibold">₦{(o.items || []).reduce((s, i) => s + (i.price * i.qty), 0)}</td>
                          <td className="px-6 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${o.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {o.payment_status || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <select value={o.payment_status || 'pending'} onChange={(e) => setOrderStatus(o.id, e.target.value)} className="border rounded px-2 py-1 text-sm">
                              <option value="pending">pending</option>
                              <option value="paid">paid</option>
                              <option value="refunded">refunded</option>
                            </select>
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td colSpan="5" className="px-6 py-4 space-y-4">
                            <div>
                              <span className="text-gray-600 font-semibold block mb-2">📦 Order Items:</span>
                              <div className="bg-white rounded p-3 space-y-2">
                                {(o.items || []).map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                                    <span className="text-gray-900">
                                      {item.name} <span className="text-gray-500 text-xs">x{item.qty}</span>
                                    </span>
                                    <span className="font-semibold text-gray-900">₦{(item.price * item.qty).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-gray-600 font-semibold">📍 Address:</span>
                                <p className="text-gray-900 mt-1">{o.address || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 font-semibold">📞 Phone:</span>
                                <p className="text-gray-900 mt-1">
                                  <a href={`tel:${o.phone}`} className="text-blue-600 hover:underline">{o.phone || 'N/A'}</a>
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Event Inquiries</h2>
            <div className="space-y-4">
              {events.map(e => (
                <div key={e.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{e.event_type}</h3>
                      <p className="text-sm text-gray-600">{e.name} • {e.phone}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${e.status === 'replied' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                      {e.status || 'new'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Guests: {e.guests} | Date: {e.event_date}</p>
                  <p className="text-sm mb-3">{e.notes}</p>
                  <button onClick={()=>setReply({ id:e.id, to:e.email, message:'' })} className="text-blue-600 hover:underline text-sm font-semibold">
                    Reply
                  </button>
                </div>
              ))}
            </div>
            
            {reply.id && (
              <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Reply to Event #{reply.id}</h3>
                <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Recipient email" value={reply.to} onChange={e=>setReply({...reply, to:e.target.value})} />
                <textarea className="w-full border rounded px-3 py-2 mb-3 h-24" placeholder="Message" value={reply.message} onChange={e=>setReply({...reply, message:e.target.value})} />
                <div className="flex gap-2">
                  <button onClick={sendReply} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Send</button>
                  <button onClick={()=>setReply({ id:null, to:'', message:'' })} className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Products</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">All Products ({products.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="bg-white rounded-lg shadow p-4">
                      {p.image && <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded mb-3" />}
                      <h4 className="font-bold text-gray-900">{p.name}</h4>
                      <p className="text-sm text-gray-600">{p.category}</p>
                      <p className="text-lg font-bold text-blue-600 mt-2">₦{p.price}</p>
                      {p.is_popular && <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">⭐ Popular</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Add Product</h3>
                <form onSubmit={addProduct} className="bg-white rounded-lg shadow p-4 space-y-3">
                  <div>
                    <input className={`w-full border rounded px-3 py-2 text-sm ${prodError.name ? 'border-red-500' : ''}`} placeholder="Name" value={prod.name} onChange={e=>setProd({...prod, name:e.target.value})} />
                    {prodError.name && <p className="text-red-600 text-xs mt-1">{prodError.name}</p>}
                  </div>
                  <div>
                    <input className={`w-full border rounded px-3 py-2 text-sm ${prodError.price ? 'border-red-500' : ''}`} type="number" step="0.01" placeholder="Price" value={prod.price} onChange={e=>setProd({...prod, price:e.target.value})} />
                    {prodError.price && <p className="text-red-600 text-xs mt-1">{prodError.price}</p>}
                  </div>
                  <div>
                    <input className={`w-full border rounded px-3 py-2 text-sm ${prodError.category ? 'border-red-500' : ''}`} placeholder="Category" value={prod.category} onChange={e=>setProd({...prod, category:e.target.value})} />
                    {prodError.category && <p className="text-red-600 text-xs mt-1">{prodError.category}</p>}
                  </div>
                  <div>
                    <textarea className={`w-full border rounded px-3 py-2 text-sm h-20 ${prodError.description ? 'border-red-500' : ''}`} placeholder="Description (min 10 chars)" value={prod.description} onChange={e=>setProd({...prod, description:e.target.value})} />
                    {prodError.description && <p className="text-red-600 text-xs mt-1">{prodError.description}</p>}
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={prod.is_popular} onChange={e=>setProd({...prod, is_popular:e.target.checked})} />
                    Popular
                  </label>
                  <input className="w-full border rounded px-3 py-2 text-sm" type="file" accept="image/*" onChange={e=>setProdImg(e.target.files?.[0] || null)} />
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">Add</button>
                  {prodMsg && <div className={`text-sm p-2 rounded ${prodMsg.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{prodMsg}</div>}
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Users Management</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-gray-900">Total Users: {users.length}</div>
                  <div className="text-sm text-gray-600">Registered Users</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.length > 0 ? users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">#{u.id}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{u.name || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-600">No users yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout as admin?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        isDangerous={true}
      />
    </div>
  );
}
