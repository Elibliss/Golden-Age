const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { pool, query, ensureTables } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'secret123';

app.use(cors());
app.use(express.json());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadsDir));

// Simple JSON store fallback when PG is not configured
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
function readJson(name, fallback) {
  const p = path.join(dataDir, name);
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}
function writeJson(name, data) {
  const p = path.join(dataDir, name);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}
const useFS = !pool;

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = h.slice(7);
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function requireAdmin(req, res, next) {
  const adminSession = req.headers['x-admin-session'];
  if (!adminSession) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const admin = jwt.verify(adminSession, JWT_SECRET);
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  console.log('Admin login attempt for:', username);

  // Check against default admin credentials
  if (username === 'admin' && password === 'admin123') {
    console.log('Admin login: default credentials used');
    const session = jwt.sign({ id: 1, username: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ session, admin: { username: 'admin' } });
  }
  
  // Also check from database/file if additional admins exist
  if (useFS) {
    const admins = readJson('admins.json', []);
    const admin = admins.find(a => a.username === username);
    if (admin) {
      try {
        const ok = await bcrypt.compare(password, admin.password_hash);
        if (ok) {
          console.log('Admin login: matched file-based admin', admin.username);
          const session = jwt.sign({ id: admin.id || 1, username: admin.username }, JWT_SECRET, { expiresIn: '7d' });
          return res.json({ session, admin: { username: admin.username } });
        } else {
          console.log('Admin login: password mismatch for', admin.username);
        }
      } catch (e) {
        console.error('Error comparing admin password:', e);
      }
    }
  } else {
    try {
      const r = await query('select id,username,password_hash from admins where username=$1', [username]);
      if (r.rowCount > 0) {
        const admin = r.rows[0];
        const ok = await bcrypt.compare(password, admin.password_hash);
        if (ok) {
          console.log('Admin login: matched DB admin', admin.username);
          const session = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '7d' });
          return res.json({ session, admin: { username: admin.username } });
        } else {
          console.log('Admin login: DB password mismatch for', admin.username);
        }
      }
    } catch (err) {
      console.error('Admin query error:', err);
    }
  }
  
  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body || {};
  
  // Validation
  if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });
  if (!password) return res.status(400).json({ error: 'Password is required' });
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  
  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) return res.status(400).json({ error: 'Invalid email address' });
  
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  
  const trimmedName = name.trim();
  if (trimmedName.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
  
  try {
    const hash = await bcrypt.hash(password, 10);
    if (useFS) {
      const users = readJson('users.json', []);
      if (users.find(u=>u.email.toLowerCase()===trimmedEmail)) return res.status(400).json({ error: 'Email already registered' });
      const id = users.length ? Math.max(...users.map(u=>u.id))+1 : 1;
      const user = { id, email: trimmedEmail, password_hash: hash, name: trimmedName, created_at: new Date().toISOString() };
      users.push(user); 
      writeJson('users.json', users);
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id, email: trimmedEmail, name: trimmedName } });
    } else {
      try {
        const r = await query('insert into app_users(email, password_hash, name) values ($1,$2,$3) returning id,email,name', [trimmedEmail, hash, trimmedName]);
        const user = r.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
      } catch (e) {
        if (e.code === '23505' || e.message.includes('duplicate')) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        throw e;
      }
    }
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  
  // Validation
  if (!email || !email.trim()) return res.status(401).json({ error: 'Email is required' });
  if (!password) return res.status(401).json({ error: 'Password is required' });
  
  const trimmedEmail = email.trim().toLowerCase();
  
  try {
    if (useFS) {
      const users = readJson('users.json', []);
      const user = users.find(u=>u.email.toLowerCase()===trimmedEmail);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } else {
      const r = await query('select id,email,password_hash,name from app_users where LOWER(email)=$1', [trimmedEmail]);
      if (r.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });
      const user = r.rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  if (useFS) {
    const users = readJson('users.json', []);
    const user = users.find(u=>u.id===req.user.id);
    return res.json({ id: user?.id, email: user?.email, name: user?.name });
  } else {
    const r = await query('select id,email,name from app_users where id=$1', [req.user.id]);
    res.json(r.rows[0]);
  }
});

app.get('/api/user/is-first-buyer', auth, async (req, res) => {
  try {
    if (useFS) {
      const orders = readJson('orders.json', []);
      const hasOrders = orders.some(o => o.user_id === req.user.id);
      res.json({ isFirstBuyer: !hasOrders });
    } else {
      const r = await query('select count(*) as count from orders where user_id=$1', [req.user.id]);
      const count = parseInt(r.rows[0]?.count || 0);
      res.json({ isFirstBuyer: count === 0 });
    }
  } catch (err) {
    console.error('First buyer check error:', err);
    res.status(500).json({ error: 'Failed to check buyer status' });
  }
});

app.get('/api/products', async (req, res) => {
  if (useFS) {
    const arr = readJson('products.json', [
      { id: 1, name: 'Small Chops Mix', price: 1500, description: 'A tasty assortment of small chops.', image: null, category: 'Small Chops', rating: 4.6, is_popular: true },
      { id: 2, name: 'Fruit Smoothie', price: 800, description: 'Fresh fruit smoothie.', image: null, category: 'Smoothies', rating: 4.7, is_popular: true }
    ]);
    return res.json(arr);
  } else {
    try {
      const r = await query('select id,name,price,description,image_url as image,category,rating,is_popular from products order by id desc', []);
      res.json(r.rows);
    } catch {
      res.json([]);
    }
  }
});

app.post('/api/products', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, price, description, category, is_popular } = req.body;
  
  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }
  
  const trimmedName = name.trim();
  if (trimmedName.length < 3) {
    return res.status(400).json({ error: 'Product name must be at least 3 characters' });
  }
  
  if (!price) {
    return res.status(400).json({ error: 'Price is required' });
  }
  
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }
  
  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }
  
  const trimmedDesc = description.trim();
  if (trimmedDesc.length < 10) {
    return res.status(400).json({ error: 'Description must be at least 10 characters' });
  }
  
  if (!category || !category.trim()) {
    return res.status(400).json({ error: 'Category is required' });
  }
  
  const image_url = req.file ? `/uploads/${path.basename(req.file.path)}` : null;
  
  try {
    if (useFS) {
      const items = readJson('products.json', []);
      const id = items.length ? Math.max(...items.map(i=>i.id))+1 : 1;
      const p = { 
        id, 
        name: trimmedName, 
        price: numPrice, 
        description: trimmedDesc, 
        image: image_url, 
        category: category.trim(), 
        is_popular: is_popular==='true',
        created_at: new Date().toISOString()
      };
      items.push(p);
      writeJson('products.json', items);
      res.json(p);
    } else {
      const r = await query(
        'insert into products(name,price,description,image_url,category,is_popular) values ($1,$2,$3,$4,$5,$6) returning *', 
        [trimmedName, numPrice, trimmedDesc, image_url, category.trim(), is_popular === 'true']
      );
      res.json(r.rows[0]);
    }
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: 'Failed to create product. Please try again.' });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (useFS) {
    const items = readJson('products.json', []);
    const idx = items.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    items.splice(idx, 1);
    writeJson('products.json', items);
    res.json({ success: true, message: 'Product deleted' });
  } else {
    const r = await query('delete from products where id=$1 returning *', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted', product: r.rows[0] });
  }
});

app.post('/api/pay/flutterwave', async (req, res) => {
  const { amount, customer, redirect_url } = req.body;
  const FLW_SECRET = process.env.FLW_SECRET_KEY;
  
  // Validation
  if (!FLW_SECRET) return res.status(400).json({ error: 'Payment service not configured. Please contact support.' });
  if (!amount) return res.status(400).json({ error: 'Amount is required' });
  if (isNaN(amount) || amount <= 0) return res.status(400).json({ error: 'Amount must be a positive number' });
  if (!redirect_url) return res.status(400).json({ error: 'Redirect URL is required' });
  
  try {
    const payload = {
      tx_ref: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      amount: Math.round(amount),
      currency: 'NGN',
      redirect_url: redirect_url,
      customer: {
        email: (customer && customer.email) || 'no-reply@goldenage.ng',
        phonenumber: (customer && customer.phone) || '',
        name: (customer && customer.name) || 'Customer'
      },
      customizations: { title: 'Golden Age Order', description: 'Food order payment' }
    };
    
    const r = await axios.post('https://api.flutterwave.com/v3/payments', payload, { 
      headers: { Authorization: `Bearer ${FLW_SECRET}` },
      timeout: 10000
    });
    
    const link = r.data?.data?.link || r.data?.data?.checkout_url || null;
    if (!link) {
      console.error('Flutterwave payment link missing:', r.data);
      return res.status(500).json({ error: 'Payment service returned invalid response. Please try again.' });
    }
    
    res.json({ ok: true, link });
  } catch (e) {
    console.error('FLW init error:', e.response?.data || e.message);
    
    // Handle specific error cases
    if (e.code === 'ECONNABORTED') {
      return res.status(500).json({ error: 'Payment service timeout. Please try again.' });
    }
    
    if (e.response?.status === 401) {
      return res.status(500).json({ error: 'Payment authentication failed. Please contact support.' });
    }
    
    if (e.response?.status === 400) {
      return res.status(400).json({ error: e.response.data?.message || 'Invalid payment parameters' });
    }
    
    res.status(500).json({ error: 'Payment initiation failed. Please check your connection and try again.' });
  }
});

app.get('/api/pay/flutterwave/verify', async (req, res) => {
  const { transaction_id } = req.query;
  const FLW_SECRET = process.env.FLW_SECRET_KEY;
  
  if (!FLW_SECRET) return res.status(400).json({ error: 'Payment service not configured' });
  if (!transaction_id) return res.status(400).json({ error: 'Missing transaction_id' });
  
  try {
    const vr = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: { Authorization: `Bearer ${FLW_SECRET}` },
      timeout: 10000
    });
    
    const data = vr.data?.data || {};
    const ok = data.status === 'successful' && (data.currency || 'NGN') === 'NGN';
    res.json({ ok, data });
  } catch (e) {
    console.error('FLW verify error:', e.response?.data || e.message);
    
    if (e.code === 'ECONNABORTED') {
      return res.status(500).json({ error: 'Payment verification timeout. Please try again.' });
    }
    
    if (e.response?.status === 404) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (e.response?.status === 401) {
      return res.status(500).json({ error: 'Payment authentication failed' });
    }
    
    res.status(500).json({ error: 'Payment verification failed. Please try again.' });
  }
});

app.post('/api/orders/finalize', auth, async (req, res) => {
  const { items, paymentMethod, paymentStatus, address, phone, lat, lon, store } = req.body;
  
  // Validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order is empty. Please add items to your cart.' });
  }
  
  if (!paymentMethod || !paymentStatus) {
    return res.status(400).json({ error: 'Missing payment information' });
  }
  
  if (paymentMethod !== 'pay_now' || paymentStatus !== 'paid') {
    return res.status(400).json({ error: 'Payment must be completed before delivery' });
  }
  
  if (!address || !address.trim()) {
    return res.status(400).json({ error: 'Delivery address is required' });
  }
  
  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  
  // Validate items structure
  for (const item of items) {
    if (!item.id || !item.name || !item.qty || !item.price) {
      return res.status(400).json({ error: 'Invalid item information' });
    }
    if (isNaN(item.qty) || item.qty <= 0 || isNaN(item.price) || item.price < 0) {
      return res.status(400).json({ error: 'Invalid item quantity or price' });
    }
  }
  
  try {
    if (useFS) {
      const arr = readJson('orders.json', []);
      const id = arr.length ? Math.max(...arr.map(o=>o.id))+1 : 1;
      const order = { 
        id, 
        user_id: req.user.id, 
        items, 
        payment_method: 'pay_now', 
        payment_status: 'paid', 
        address: address.trim() || null, 
        phone: phone.trim() || null, 
        lat: lat || null, 
        lon: lon || null, 
        store: store || null, 
        created_at: new Date().toISOString() 
      };
      arr.push(order); 
      writeJson('orders.json', arr);
      return res.json({ order });
    } else {
      const r = await query(
        'insert into orders(user_id,items,payment_method,payment_status,address,phone,lat,lon,store) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *',
        [req.user.id, JSON.stringify(items), 'pay_now', 'paid', address.trim() || null, phone.trim() || null, lat || null, lon || null, store || null]
      );
      res.json({ order: r.rows[0] });
    }
  } catch (err) {
    console.error('Order finalization error:', err);
    res.status(500).json({ error: 'Failed to finalize order. Please try again.' });
  }
});

app.get('/api/orders', requireAdmin, async (req, res) => {
  if (useFS) {
    const arr = readJson('orders.json', []);
    return res.json(arr.sort((a,b)=>b.id-a.id));
  } else {
    const r = await query('select * from orders order by id desc', []);
    res.json(r.rows);
  }
});

app.post('/api/orders/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (useFS) {
    const arr = readJson('orders.json', []);
    const idx = arr.findIndex(o=>String(o.id)===String(id));
    if (idx===-1) return res.status(404).json({ error: 'Not found' });
    arr[idx].payment_status = status;
    writeJson('orders.json', arr);
    return res.json({ order: arr[idx] });
  } else {
    const r = await query('update orders set payment_status=$1 where id=$2 returning *', [status, id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ order: r.rows[0] });
  }
});

app.post('/api/events', async (req, res) => {
  const { event_type, guests, event_date, name, email, phone, notes } = req.body;
  
  // Validation
  if (!event_type || !event_type.trim()) {
    return res.status(400).json({ error: 'Event type is required' });
  }
  
  if (!guests) {
    return res.status(400).json({ error: 'Number of guests is required' });
  }
  
  const numGuests = Number(guests);
  if (isNaN(numGuests) || numGuests <= 0) {
    return res.status(400).json({ error: 'Number of guests must be a positive number' });
  }
  
  if (!event_date) {
    return res.status(400).json({ error: 'Event date is required' });
  }
  
  const eventDate = new Date(event_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (eventDate < today) {
    return res.status(400).json({ error: 'Event date must be in the future' });
  }
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  
  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: 'Phone is required' });
  }
  
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }
  
  if (!notes || !notes.trim()) {
    return res.status(400).json({ error: 'Event description is required' });
  }
  
  if (notes.trim().length < 10) {
    return res.status(400).json({ error: 'Event description must be at least 10 characters' });
  }
  
  try {
    if (useFS) {
      const arr = readJson('events.json', []);
      const id = arr.length ? Math.max(...arr.map(e=>e.id))+1 : 1;
      const ev = { 
        id, 
        event_type: event_type.trim(), 
        guests: numGuests, 
        event_date, 
        name: name.trim(), 
        email: email.trim(), 
        phone: phone.trim(), 
        notes: notes.trim(), 
        status: 'new', 
        created_at: new Date().toISOString() 
      };
      arr.push(ev);
      writeJson('events.json', arr);
      return res.json({ event: ev, message: 'We will get back to you shortly' });
    } else {
      const r = await query(
        'insert into events(event_type,guests,event_date,name,email,phone,notes) values ($1,$2,$3,$4,$5,$6,$7) returning *', 
        [event_type.trim(), numGuests, event_date, name.trim(), email.trim(), phone.trim(), notes.trim()]
      );
      res.json({ event: r.rows[0], message: 'We will get back to you shortly' });
    }
  } catch (err) {
    console.error('Event booking error:', err);
    res.status(500).json({ error: 'Failed to save event booking. Please try again.' });
  }
});

app.get('/api/events', requireAdmin, async (req, res) => {
  if (useFS) {
    const arr = readJson('events.json', []);
    return res.json(arr.sort((a,b)=>b.id-a.id));
  } else {
    const r = await query('select * from events order by id desc', []);
    res.json(r.rows);
  }
});

app.post('/api/events/:id/reply', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { message, to } = req.body;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return res.status(400).json({ error: 'Email not configured' });
  try {
    const msg = {
      to,
      from: process.env.EMAIL_USER,
      subject: 'Golden Age Event Booking',
      text: message,
      html: `<p>${message}</p>`
    };
    await transporter.sendMail(msg);
    if (useFS) {
      const arr = readJson('events.json', []);
      const idx = arr.findIndex(e=>String(e.id)===String(id));
      if (idx>-1) { arr[idx].status='replied'; writeJson('events.json', arr); }
    } else {
      await query('update events set status=$1 where id=$2', ['replied', id]);
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to send' });
  }
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    if (useFS) {
      const users = readJson('users.json', []);
      const orders = readJson('orders.json', []);
      const buyerEmails = new Set(orders.map(o => o.email));
      res.json({
        total_users: users.length,
        total_buyers: buyerEmails.size
      });
    } else {
      const usersRes = await query('select count(*) as count from app_users');
      const buyersRes = await query('select count(distinct email) as count from orders');
      res.json({
        total_users: parseInt(usersRes.rows[0]?.count || 0),
        total_buyers: parseInt(buyersRes.rows[0]?.count || 0)
      });
    }
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    if (useFS) {
      const users = readJson('users.json', []);
      res.json(users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        created_at: u.created_at
      })));
    } else {
      const r = await query('select id,email,name,created_at from app_users order by created_at desc');
      res.json(r.rows);
    }
  } catch (err) {
    console.error('Users fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

ensureTables().then(() => {
  app.listen(port, () => console.log(`Server on ${port}`));
});
