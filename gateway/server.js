const path = require('path');
require('dotenv').config({path: '../.env'})
const gateway = require('express-gateway');
//const { checkToken } = require("../auth/token_validation");
gateway()
  .load(path.join(__dirname, 'config'))
  .run();
