const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/authRoutes'); 
const userRouter = require('./routes/userRoutes');
const storeRouter = require('./routes/storeRoutes');
const assistantRouter = require('./routes/assistantRoutes');

require('dotenv').config();

// Node on some Windows setups sees only 127.0.0.1 as its DNS server and can't resolve the
// mongodb+srv address (querySrv ECONNREFUSED); use public DNS in that case.
const dns = require('dns');
if (dns.getServers().every((s) => s.startsWith('127.') || s === '::1')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

// Always use the dailydeals database, even if MONGO_URI has no /dbname (Mongo would fall back to an empty "test").
const DB_OPTIONS = { dbName: process.env.MONGO_DB_NAME || "dailydeals" };

const app = express();
const checkingInAdmin = (req, res, next) => {
  console.log("Admin middleware is checking in", req);
  next();
}
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

// The live site's address is always allowed. During development any localhost
// port is too: Vite moves to 5174, 5175… when 5173 is busy, and a blocked
// origin silently shows every page as empty.
const isDev = process.env.NODE_ENV !== "production" && !process.env.VERCEL;
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: (origin, done) => {
    const localDev = isDev && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");
    done(null, !origin || origin === allowedOrigin || localDev);
  },
  credentials: true,
}));


let cachedDbPromise = mongoose.connect(process.env.MONGO_URI, DB_OPTIONS)
  .then((conn) => {
    console.log('✅ MongoDB initial connection success');
    return conn;
  })
  .catch((err) => {
    console.error('❌ MongoDB initial connection error:', err);
    cachedDbPromise = null;
    throw err;
  });

app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  if (!cachedDbPromise) {
    console.log('🔄 Re-attempting MongoDB connection...');
    cachedDbPromise = mongoose.connect(process.env.MONGO_URI, DB_OPTIONS)
      .then((conn) => {
        console.log('✅ MongoDB connection established');
        return conn;
      })
      .catch((err) => {
        cachedDbPromise = null;
        console.error('❌ MongoDB connection retry error:', err);
        throw err;
      });
  }

  try {
    await cachedDbPromise;
    next();
  } catch (err) {
    return res.status(500).json({ 
      message: "Database connection failed", 
      error: err.message 
    });
  }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Hit daily by the Vercel cron in vercel.json so free-tier Supabase (paused after ~7 idle days)
// and MongoDB see activity. Read-only and cheap, so it needs no auth.
app.get('/api/keepalive', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    const sb = await fetch(`${process.env.SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.SUPABASE_ANON_KEY },
    });
    res.status(sb.ok ? 200 : 502).json({ mongo: 'ok', supabase: sb.status });
  } catch (err) {
    res.status(500).json({ message: 'Keepalive failed', error: err.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/customer', userRouter);
app.use('/api/store', storeRouter);
app.use('/api/assistant', assistantRouter);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
  });
}

module.exports = app;
