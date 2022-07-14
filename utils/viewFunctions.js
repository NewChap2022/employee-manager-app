const db = require('../db/connection');
const cTable = require('console.table');

const viewAll = (action) => {
    const content = action.split(" ")[2];
    let sql = '';
    if (content === 'departments') {
        sql = `SELECT * FROM departments`
    } else if (content === 'roles') {
        sql = `SELECT roles.id, roles.title, roles.salary, departments.name AS department
                FROM roles
                LEFT JOIN departments
                ON roles.department_id = departments.id;`
    } else if (content === 'employees') {
        sql = `SELECT e.id, e.first_name, e.last_name, 
                roles.title AS role_title,
                CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                FROM employees e
                LEFT JOIN employees m ON
                m.id = e.manager_id 
                LEFT JOIN roles ON roles.id = e.role_id`
    }
    return db.promise().query(sql);
};

module.exports = viewAll