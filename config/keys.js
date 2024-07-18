module.exports = {
   mongoURI: 'mongodb+srv://ynewayne:400carrots#12@talentconnect.l58ln7n.mongodb.net/?retryWrites=true&w=majority&appName=talentconnect',
   secretOrKey: 'secret'
};

if(process.env.NODE_ENV === 'production'){
  module.exports = require('./keys_prod');
}else{
  module.exports = require('./keys_dev');
}
