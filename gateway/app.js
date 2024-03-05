const express = require("express");
var cors = require('cors')

const app = express();
const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUI = require("swagger-ui-express")
swaggerDocument = require('./swagger.json')
const swaggerOptions = {  
    swaggerDefinition: {  
        info: {  
            title:'Employee API',  
            version:'1.0.0'  
        }  
    },  
    apis:['app.js'],  
}  
const swaggerDocs = swaggerJSDoc(swaggerOptions);  
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocument));  

app.get('/Employees',(req,res)=>{  
    res.send([  
        {  
            id:1, Name:'Jk'  
        },  
        {  
            id:2,Name:'Jay'  
        }  
    ])  
});  
app.listen(5001, () => {
    console.log("Server running on port : ", 5001);
    
});
