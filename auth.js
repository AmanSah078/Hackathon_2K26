// ================================================================
// PostOBT — Auth Middleware
// File: middleware/auth.js
// Har protected route pe ye middleware lagega
// ================================================================

const jwt  = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Token — cookie se ya Authorization header se
    if (req.cookies && req.cookies.postobt_token) {
      token = req.cookies.postobt_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // API request hai to JSON error, warna login page pe redirect
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ success: false, message: 'Not logged in. Please login first.' });
      }
      return res.redirect('/login');
    }

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // DB unavailable ho to token data se minimal user build karo.
    if (mongoose.connection.readyState !== 1) {
      req.user = {
        _id: decoded.id,
        username: decoded.username || '',
        email: '',
        mobile: '',
        displayName: decoded.username || 'User',
        avatar: '',
        bio: '',
        theme: 'light',
        connectedPlatforms: {
          instagram: false,
          youtube: false,
          twitter: false,
          facebook: false
        },
        createdAt: null,
        lastLogin: null
      };
      return next();
    }

    // User database se fetch karo
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // req mein user attach kar do
    req.user = user;
    next();

  } catch (err) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
    }
    res.clearCookie('postobt_token');
    return res.redirect('/login');
  }
};

module.exports = { protect };
