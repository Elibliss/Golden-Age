import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { isValidAddress, isValidPhone } from '../utils';

export default function Checkout(){
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loc, setLoc] = useState({ lat: null, lon: null });
  const [isPaid, setIsPaid] = useState(false);
  const [status, setStatus] = useState(null);
  const [isFirstBuyer, setIsFirstBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('post_login_redirect', '/checkout');
      navigate('/signup');
      return;
    }
    const c = localStorage.getItem('cart');
    if (c) setCart(JSON.parse(c));
    
    // Check if first-time buyer
    axios.get('/api/user/is-first-buyer', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => setIsFirstBuyer(r.data?.isFirstBuyer))
      .catch(() => setIsFirstBuyer(false))
      .finally(() => setLoading(false));
  },[navigate]);

  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const txId = params.get('transaction_id');
    if (txId) {
      axios.get('/api/pay/flutterwave/verify', { params: { transaction_id: txId } })
        .then(r => { if (r.data && r.data.ok) setIsPaid(true); })
        .catch((err)=>{
          const errorMsg = err.response?.data?.error || 'Payment verification failed';
          setErrors({ payment: errorMsg });
        });
    }
  },[location.search]);

  function getLocation(){
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(pos=>{
      setLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    },()=>{ alert('Could not get location'); });
  }
  
  function validateCheckoutFields() {
    const newErrors = {};
    
    if (!address.trim()) {
      newErrors.address = 'Delivery address is required';
    } else if (!isValidAddress(address)) {
      newErrors.address = 'Address must be at least 10 characters';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function proceedToPayment(){
    setPaymentLoading(true);
    setErrors({});
    
    if (!validateCheckoutFields()) {
      setPaymentLoading(false);
      return;
    }
    
    try{
      const amount = cart.reduce((s,i)=>s + (i.price||0) * (i.qty||1), 0);
      const redirect = window.location.origin + '/checkout';
      const r = await axios.post('/api/pay/flutterwave', { amount, customer: {}, redirect_url: redirect });
      if (r.data && r.data.link) {
        window.location.href = r.data.link;
      } else {
        setErrors({ payment: 'Payment initiation failed. Please try again.' });
      }
    }catch(err){ 
      const errorMsg = err.response?.data?.error || 'Payment initiation failed. Please check your connection and try again.';
      setErrors({ payment: errorMsg });
    } finally {
      setPaymentLoading(false);
    }
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
  async function finalizeOrder(){
    if (!validateCheckoutFields()) {
      return;
    }
    
    setOrderLoading(true);
    setErrors({});
    try{
      const items = cart.map(i=>({ id:i.id, name:i.name, qty:i.qty, price:i.price }));
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/orders/finalize', { items, address, phone, lat: loc.lat, lon: loc.lon, paymentMethod: 'pay_now', paymentStatus: 'paid' }, { headers: { Authorization: 'Bearer ' + token } });
      setStatus(res.data);
      localStorage.removeItem('cart');
    }catch(err){ 
      const errorMsg = err.response?.data?.error || 'Order finalization failed. Please try again.';
      setErrors({ order: errorMsg });
    } finally {
      setOrderLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="card p-6">
        {!status && (
          <div className="mt-4">
            <h4 className="font-semibold">Items</h4>
            {cart.map(i=> <div key={i.id} className="flex items-center justify-between py-2 border-b pb-2">
              <div className="flex-1">
                <div className="font-medium">{i.name}</div>
                <div className="text-sm text-gray-600">₦{i.price} x {i.qty}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={()=>decreaseQty(i.id)} className="h-6 w-6 rounded border bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs">−</button>
                <span className="w-5 text-center text-xs font-semibold">{i.qty}</span>
                <button onClick={() => {cart.find(x=>x.id===i.id).qty++; setCart([...cart]); localStorage.setItem('cart', JSON.stringify(cart));}} className="h-6 w-6 rounded border bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs">+</button>
                <button onClick={()=>remove(i.id)} className="ml-1 h-6 w-6 rounded border border-red-300 bg-red-50 hover:bg-red-100 flex items-center justify-center text-xs text-red-600 font-bold">✕</button>
              </div>
            </div>)}
            <div className="flex justify-between py-2 border-t mt-2 font-semibold">
              <div className="text-gray-600">Total</div>
              <div>₦{cart.reduce((s,i)=>s + (i.price*i.qty), 0)}</div>
            </div>
          </div>
        )}

        {!isPaid ? (
          <div className="mt-2">
            {errors.payment && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{errors.payment}</div>}
            {isFirstBuyer && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-blue-900 mb-2">First-Time Buyer - Delivery Info Required</h4>
                <input className={`w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-blue-300'} rounded-lg mt-2 text-sm`} placeholder="Delivery Address (min 10 chars)" value={address} onChange={e=>setAddress(e.target.value)} />
                {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                <input className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-blue-300'} rounded-lg mt-2 text-sm`} placeholder="Phone Number" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                <button onClick={getLocation} className="w-full text-sm mt-2 px-3 py-2 bg-blue-200 hover:bg-blue-300 text-blue-900 rounded-lg">Use Current Location</button>
              </div>
            )}
            {!isFirstBuyer && (
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-gray-900 mb-2">Delivery Information</h4>
                <input className={`w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg mt-2 text-sm`} placeholder="Delivery Address (min 10 chars)" value={address} onChange={e=>setAddress(e.target.value)} />
                {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                <input className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg mt-2 text-sm`} placeholder="Phone Number" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                <button onClick={getLocation} className="w-full text-sm mt-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg">Use Current Location</button>
              </div>
            )}
            <h4 className="font-semibold">Payment</h4>
            <div className="text-sm text-gray-600 mt-1">You'll be redirected to securely pay online.</div>
            <div className="mt-3 text-right">
              <button onClick={proceedToPayment} disabled={paymentLoading} className={`btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed ${errors.address || errors.phone ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {paymentLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        ) : null}

        {isPaid && !status ? (
          <div className="mt-4 space-y-4">
            {errors.order && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{errors.order}</div>}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">Delivery Information</h4>
              <input className={`w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg mt-2 text-sm`} placeholder="Delivery Address (min 10 chars)" value={address} onChange={e=>setAddress(e.target.value)} />
              {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
              <input className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg mt-2 text-sm`} placeholder="Phone Number" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              <button onClick={getLocation} className="w-full text-sm mt-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg">Use Current Location</button>
            </div>
            <div className="text-right">
              <button onClick={finalizeOrder} disabled={orderLoading} className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {orderLoading ? 'Processing...' : 'Finalize Order'}
              </button>
            </div>
          </div>
        ) : null}

        {status ? (
          <div className="mt-8 max-w-lg">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-8 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-200 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-green-800 mb-2">Order Confirmed! 🎉</h2>
              <p className="text-green-700 text-lg mb-4">Thank you for your patronage!</p>
              
              <div className="bg-white rounded-lg p-4 my-6 border border-green-200">
                <p className="text-gray-700 mb-2"><span className="font-semibold">Your delicious meal is being</span></p>
                <p className="text-green-600 font-bold text-xl">PREPARED NOW</p>
                <p className="text-gray-600 text-sm mt-3">Our team is working hard to get your order ready for delivery</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <p className="text-sm text-gray-600"><span className="font-semibold">Order will arrive at:</span></p>
                <p className="text-blue-700 font-semibold">{phone}</p>
                <p className="text-gray-600 text-xs mt-2">{address}</p>
              </div>
              
              <p className="text-gray-700 mb-6">You'll receive updates as your order is on its way!</p>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('cart');
                  navigate('/');
                }} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Back to Menu
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
