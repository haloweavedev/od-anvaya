const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect(req.session.user.is_admin ? '/admin' : '/');
  res.render('auth/login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.render('auth/login', { error: 'Please fill in all fields.' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) return res.render('auth/login', { error: 'No account found with this email.' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.render('auth/login', { error: 'Incorrect password.' });

    req.session.user = { id: user.id, email: user.email, name: user.name, org_name: user.org_name, is_admin: user.is_admin };
    res.redirect(user.is_admin ? '/admin' : '/');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { error: 'Login failed. Please try again.' });
  }
});

// Register page
router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/register', { error: null });
});

router.post('/register', async (req, res) => {
  const { email, password, confirmPassword, name, orgName } = req.body;
  if (!email || !password || !name || !orgName) return res.render('auth/register', { error: 'Please fill in all fields.' });
  if (password !== confirmPassword) return res.render('auth/register', { error: 'Passwords do not match.' });
  if (password.length < 6) return res.render('auth/register', { error: 'Password must be at least 6 characters.' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.render('auth/register', { error: 'An account with this email already exists.' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, org_name) VALUES ($1, $2, $3, $4) RETURNING *',
      [email.toLowerCase(), hash, name, orgName]
    );
    const user = result.rows[0];
    req.session.user = { id: user.id, email: user.email, name: user.name, org_name: user.org_name, is_admin: false };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('auth/register', { error: 'Registration failed. Please try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
