module.exports = {
   mongoURI: 'mongodb://localhost:27017/talentconnect',
   secretOrKey: 'secret.txt'
};

if(process.env.NODE_ENV === 'production'){
  module.exports = require('./keys_prod');
}else{
  module.exports = require('./keys_dev');
}
