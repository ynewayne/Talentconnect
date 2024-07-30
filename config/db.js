const mongoose = require('mongoose');
const db = require('./config/keys').mongoURI;  // Adjust the path according to the db location

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
