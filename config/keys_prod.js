const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const keyFilePath = path.join(__dirname, 'secret_key.txt');

// Function to generate a new secret key
const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Function to get the secret key
const getSecretKey = () => {
  if (fs.existsSync(keyFilePath)) {
    return fs.readFileSync(keyFilePath, 'utf8');
  } else {
    const newKey = generateSecretKey();
    fs.writeFileSync(keyFilePath, newKey);
    return newKey;
  }
};

// Export the configuration
module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/talentconnect', // Local MongoDB connection string
  secretOrKey: process.env.SECRET_OR_KEY || getSecretKey(), // Use the key from the file or generate a new one
  googleClientID: process.env.GOOGLE_CLIENTID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  facebookClientId: process.env.FACEBOOK_CLIENTID,
  cookieKey: process.env.COOKIE_KEY,
  emailConfirm: process.env.EMAIL_CONFIRM,
  passwordConfirm: process.env.PASSWORD_CONFIRM
};
