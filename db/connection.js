const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'SQL2022password',
        database: 'employee'
    },
    console.log('Connected to the employee database')
);

module.exports = db;