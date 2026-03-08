import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import Events from './pages/Events';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import AdminSecret from './pages/AdminSecret';
import AdminLogin from './pages/AdminLogin';
import Contact from './pages/Contact';
import ConfirmationModal from './ConfirmationModal';

function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [adminSession, setAdminSession] = useState(localStorage.getItem('admin_session'));
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Hide navbar on auth pages and admin dashboard
  const hideNavbar = ['/login', '/signup', '/admin-login', '/admin', '/admin/secret'].includes(location.pathname);
  
  useEffect(()=> {
    const on = ()=> {
      setToken(localStorage.getItem('token'));
      setAdminSession(localStorage.getItem('admin_session'));
    };
    window.addEventListener('storage', on);
    return ()=> window.removeEventListener('storage', on);
  },[]);
  
  function handleLogout(){
    localStorage.removeItem('token');
    setToken(null);
    setShowLogoutModal(false);
    navigate('/');
  }
  
  function adminLogout(){
    localStorage.removeItem('admin_session');
    setAdminSession(null);
    navigate('/admin-login');
  }
  
  if (hideNavbar) return null;
  
  return (
    <>
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
      <div className="container-pro py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-accent"></div>
          <span className="text-xl font-bold tracking-tight">Golden Age</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-20">
          <Link to="/">Home</Link>
          <Link to="/shop">Menu</Link>
          <Link to="/events">Book Event</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {!token ? (
            <>
              <Link to="/login" className="btn-outline px-4 py-2">Sign In</Link>
              <Link to="/shop" className="btn-primary px-4 py-2">Make Order</Link>
            </>
          ):(
            <>
              <Link to="/shop" className="btn-primary px-4 py-2">Make Order</Link>
              <button onClick={() => setShowLogoutModal(true)} className="btn-outline px-4 py-2">Logout</button>
            </>
          )}
        </div>
        <button onClick={()=>setOpen(v=>!v)} className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border bg-white">
          <span className="sr-only">Menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 1 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 1 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm.75 5.25a.75.75 0 0 0 0 1.5h15a.75.75 0 1 0 0-1.5h-15Z" clipRule="evenodd" /></svg>
        </button>
      </div>
      {open ? (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" onClick={()=>setOpen(false)} className="block py-2">Home</Link>
            <Link to="/shop" onClick={()=>setOpen(false)} className="block py-2">Menu</Link>
            <Link to="/events" onClick={()=>setOpen(false)} className="block py-2">Services</Link>
            {!token ? (
              <Link to="/login" onClick={()=>setOpen(false)} className="block py-2">Sign In</Link>
            ) : (
              <button onClick={()=>{setOpen(false); localStorage.removeItem('token'); window.location.reload();}} className="block py-2">Logout</button>
            )}
            <Link to="/shop" onClick={()=>setOpen(false)} className="block py-2 text-accent font-semibold">Make Order</Link>
          </div>
        </div>
      ) : null}
    </header>
    <ConfirmationModal
      isOpen={showLogoutModal}
      title="Logout"
      message="Are you sure you want to logout?"
      confirmText="Yes, Logout"
      cancelText="Cancel"
      onConfirm={handleLogout}
      onCancel={() => setShowLogoutModal(false)}
      isDangerous={true}
    />
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="container-pro py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div>
            <div className="text-lg font-semibold">Golden Age</div>
            <div className="text-sm text-gray-600">Small chops • Smoothies • Events</div>
            <div className="flex gap-4 mt-3">
              <a href="https://www.instagram.com/goldenage.ng/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 hover:bg-pink-500 transition">
                <svg className="w-4 h-4 text-gray-700 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="text-sm text-gray-600 text-center md:text-right">Enugu State, Nigeria</div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} Golden Age</div>
      </div>
    </footer>
  );
}function AppContent() {
  const location = useLocation();
  const hideFooter = ['/login', '/signup', '/admin-login', '/admin', '/admin/secret'].includes(location.pathname);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1" style={{width: location.pathname === '/admin' || location.pathname === '/admin/secret' ? '100%' : undefined}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/secret" element={<AdminSecret />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
