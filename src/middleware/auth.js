const jwt = require('jsonwebtoken');

const authJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Akses ditolak, token tidak ada' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak valid' });
    }

    req.user = user;
    next();
  });
};

module.exports = { authJWT };
