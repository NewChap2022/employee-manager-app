const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'SQL2022password',
        database: 'employees_info'
    },
    console.log('Connected to the employees_info database')
);

module.exports = db;