import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Shop(){
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')||'[]'));
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    api.get('/api/products').then(r=>setProducts(r.data)).catch(()=>{});
  },[]);

  function add(p){
    setCart(prev=>{
      const found = prev.find(x=>x.id===p.id);
      const next = found ? prev.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x) : [...prev,{...p,qty:1}];
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }
  function decreaseQty(id){
    setCart(prev=>{
      const next = prev.map(x=>x.id===id?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0);
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }
  function remove(id){
    setCart(prev=>{
      const next = prev.filter(x=>x.id!==id);
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }
  function gotoCheckout(){
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/checkout');
  }
  const filtered = products.filter(p=>{
    const t = (p.name||'') + ' ' + (p.description||'');
    return !query || t.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Our Menu</h1>
            <p className="text-gray-600 mt-2">Discover delicious meals prepared with care</p>
          </div>
          <div className="md:w-72">
            <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search items..." />
          </div>
        </div>
        
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(p=> (
              <div key={p.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                <div className="relative h-48 overflow-hidden bg-gray-200 flex items-center justify-center">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-4xl mb-2">🍽️</div>
                      <p className="text-sm">No image</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">{p.name}</h3>
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold whitespace-nowrap ml-2">₦{p.price}</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{p.category || 'Meal'}</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★★★★★</span>
                      <span className="ml-1">{p.rating || '4.5'}</span>
                    </div>
                    <span>15–25 min</span>
                  </div>
                  <button onClick={()=>add(p)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2">
                    <span>+</span> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed right-6 bottom-6 bg-white rounded-2xl shadow-2xl border border-gray-200 w-full sm:w-96 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg text-gray-900">🛒 Cart</h4>
              <p className="text-xs text-gray-500">{cart.reduce((s,i)=>s + (i.qty||0), 0)} items</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {cart.map(i=> (
              <div key={i.id} className="flex items-center gap-3 py-2 border-b pb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{i.name}</div>
                  <div className="text-sm text-gray-600">₦{i.price} × {i.qty}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={()=>decreaseQty(i.id)} className="h-7 w-7 rounded border border-gray-300 bg-gray-50 hover:bg-gray-200 flex items-center justify-center text-sm font-semibold transition">−</button>
                  <span className="w-6 text-center text-sm font-bold">{i.qty}</span>
                  <button onClick={()=>add(i)} className="h-7 w-7 rounded border border-gray-300 bg-gray-50 hover:bg-gray-200 flex items-center justify-center text-sm font-semibold transition">+</button>
                  <button onClick={()=>remove(i.id)} className="ml-1 h-7 w-7 rounded border border-red-300 bg-red-50 hover:bg-red-100 flex items-center justify-center text-xs text-red-600 font-bold transition">✕</button>
                </div>
              </div>
            ))}
          </div>
          <div className="sticky bottom-0 bg-white border-t p-4 space-y-3">
            <div className="flex items-center justify-between font-bold text-gray-900">
              <span>Total:</span>
              <span className="text-xl">₦{cart.reduce((s,i)=>s + (i.price*i.qty), 0)}</span>
            </div>
            <button onClick={gotoCheckout} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200 shadow-md">
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
