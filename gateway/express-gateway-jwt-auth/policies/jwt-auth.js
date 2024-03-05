const jwt = require('jsonwebtoken');

module.exports = {
    name: 'jwt-auth',
    schema: { // This is for Admin API to validate params
      $id: "http://express-gateway.io/schemas/plugin-configure-example.json",
    },
    policy: (actionParams) => {
      return (req, res, next) => {

        let token = req.headers['authorization'];
        
        if (!token) {
          return res.status(401).json({
            message: 'No token provided.'
          });
        }

        var auth_type = token.split(" ")
        var token_type = auth_type[0]
        
        if(token_type == "Basic"){
          token = token.replace('Basic ', '');
          if(token != process.env.BASIC_AUTH_KEY){

            return res.status(401).json({
              message: 'Token is not valid.'
            });
          }
          next();
        } else if(token_type == "Bearer"){

          token = token.replace('Bearer ', '');
          jwt.verify(token, process.env.SECRET, (err, decoded) => {
          
            if (err) {
              return res.status(401).json({
                message: 'Access denied ! unauthorized dealer'
              });
            }  

            req.user = decoded;
            next();
          });

        } else{

          return res.status(401).json({
            message: 'Access denied ! unauthorized dealer'
          });
        }
        
      }
    }
  }