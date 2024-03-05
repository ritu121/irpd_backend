require('dotenv').config({path: '../.env'})
const { createPool } = require("mysql2");
const connect_pool = createPool({
    port:process.env.DB_PORT,
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
});

//console.log(connect_pool)
module.exports = connect_pool;



