const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).send('Invalid Credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send('Invalid Credentials');

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, role: user.role });
});

module.exports = router;