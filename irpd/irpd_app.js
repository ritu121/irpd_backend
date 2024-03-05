const express = require("express");
var cors = require('cors')
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');                        


require('dotenv').config({path: '../.env'}) 

const irpdRouter = require("./irpd-router")
app.use(express.json()); 
app.use(express.static('public'));
app.use(cors())
app.use(bodyParser.json());
app.use('', irpdRouter); 

app.listen(process.env.IRPD_PORT, () => {
    console.log("Server running on port : ", process.env.IRPD_PORT);
});