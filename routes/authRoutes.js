const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { user_id: req.user.user_id, email: req.user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?token=${token}`);
  }
);

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Verify user still exists in DB (handles re-seed scenarios)
    const prisma = require('../prismaClient');
    let user = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });
    
    if (!user) {
      // User was deleted (e.g. by re-seed). Try finding by email or create fresh.
      user = await prisma.user.upsert({
        where: { email: decoded.email },
        update: {},
        create: { email: decoded.email, name: decoded.email.split('@')[0] }
      });
      
      // Issue a fresh token with the new user_id
      const newToken = jwt.sign(
        { user_id: user.user_id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '30d' }
      );
      return res.json({ user_id: user.user_id, email: user.email, name: user.name, refreshedToken: newToken });
    }
    
    res.json({ user_id: user.user_id, email: user.email, name: user.name });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
