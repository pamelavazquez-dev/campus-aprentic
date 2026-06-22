const admin = require('../config/firebaseAdmin');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided or invalid format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...decodedToken
    };
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  verifyToken
};
