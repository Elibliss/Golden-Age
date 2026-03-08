const { Pool } = require('pg');

const connStr = process.env.PG_CONNECTION_STRING || process.env.DATABASE_URL || null;
let pool = null;
if (connStr) {
  pool = new Pool({ connectionString: connStr, ssl: /amazonaws|azure|render|railway|vercel|neon|supabase|heroku/i.test(connStr) ? { rejectUnauthorized: false } : false });
}

async function query(text, params) {
  if (!pool) throw new Error('PG not configured');
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function ensureTables() {
  if (!pool) return;
  await query(`create table if not exists app_users (
    id serial primary key,
    email text unique not null,
    password_hash text not null,
    name text,
    created_at timestamp default now()
  )`);
  await query(`create table if not exists products (
    id serial primary key,
    name text not null,
    price numeric not null,
    description text,
    image_url text,
    category text,
    rating numeric,
    is_popular boolean default false,
    created_at timestamp default now()
  )`);
  await query(`create table if not exists orders (
    id serial primary key,
    user_id integer references app_users(id),
    items jsonb not null,
    store jsonb,
    distance_km numeric,
    payment_method text,
    payment_status text,
    address text,
    phone text,
    lat double precision,
    lon double precision,
    created_at timestamp default now()
  )`);
  await query(`create table if not exists events (
    id serial primary key,
    user_id integer references app_users(id),
    event_type text,
    guests integer,
    event_date text,
    name text,
    email text,
    phone text,
    notes text,
    status text default 'new',
    created_at timestamp default now()
  )`);
}

module.exports = { pool, query, ensureTables };
