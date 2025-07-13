const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

// Auth middleware
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// GET all transactions (with filters)
router.get('/', auth, async (req, res) => {
  const { type, start, end } = req.query;
  let filter = { user: req.user };
  if (type) filter.type = type;
  if (start || end) filter.date = {};
  if (start) filter.date.$gte = new Date(start);
  if (end) filter.date.$lte = new Date(end);
  const transactions = await Transaction.find(filter).sort({ date: -1 });
  res.json(transactions);
});

// POST a new transaction
router.post('/', auth, async (req, res) => {
  const { text, amount, type } = req.body;
  const newTrans = new Transaction({ text, amount, type, user: req.user });
  await newTrans.save();
  res.json(newTrans);
});

// DELETE a transaction
router.delete('/:id', auth, async (req, res) => {
  await Transaction.deleteOne({ _id: req.params.id, user: req.user });
  res.json({ msg: 'Deleted' });
});

module.exports = router;
