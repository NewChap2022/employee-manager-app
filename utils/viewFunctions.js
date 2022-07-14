const inquirer = require('inquirer');
const db = require('../db/connection');

const viewAll = action => {
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
        sql = `SELECT e.id, 
                CONCAT(e.first_name, ' ', e.last_name) AS name, 
                roles.title AS title,
                roles.salary AS salary,
                departments.name AS department,
                CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                FROM employees e
                LEFT JOIN employees m ON
                m.id = e.manager_id 
                LEFT JOIN roles ON roles.id = e.role_id
                LEFT JOIN departments ON departments.id = roles.department_id`                
    }
    return db.promise().query(sql);
};

const viewByManager = () => {
    let managersInfo
    let managers = []
    let sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees WHERE manager_id is NULL`
    return db.promise().query(sql)
        .then(result => {
            managersInfo = result[0];
            managersInfo.map(element => managers.push(element.name));
            return inquirer.prompt([
                {
                    type: 'rawlist',
                    name: 'manager',
                    message: "Which manager's team would you like to view?",
                    choices: managers
                }
            ])
        .then(answer => {
            const managerId = managersInfo.filter(element => element.name === answer.manager)[0].id;
            sql = `SELECT e.id, 
            CONCAT(e.first_name, ' ', e.last_name) AS name, 
            roles.title AS title,
            roles.salary AS salary,
            departments.name AS department,
            CONCAT(m.first_name, ' ', m.last_name) AS manager_name
            FROM employees e
            LEFT JOIN employees m ON
            m.id = e.manager_id 
            LEFT JOIN roles ON roles.id = e.role_id
            LEFT JOIN departments ON departments.id = roles.department_id
            WHERE e.manager_id = ${managerId}`;
            return db.promise().query(sql);
        })
    })
};

viewByDepartment = () => {
    let departmentsInfo
    let departments = []
    let sql = `SELECT * FROM departments`
    return db.promise().query(sql)
        .then(result => {
            departmentsInfo = result[0];
            departmentsInfo.map(element => departments.push(element.name));
            return inquirer.prompt([
                {
                    type: 'rawlist',
                    name: 'department',
                    message: "Which department's members would you like to view?",
                    choices: departments
                }
            ])
        .then(answer => {
            const departmentId = departmentsInfo.filter(element => element.name === answer.department)[0].id;
            sql = `SELECT e.id, 
                    CONCAT(e.first_name, ' ', e.last_name) AS name, 
                    roles.title AS title,
                    roles.salary AS salary,
                    departments.name AS department,
                    CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                    FROM employees e
                    LEFT JOIN employees m ON
                    m.id = e.manager_id 
                    LEFT JOIN roles ON roles.id = e.role_id
                    LEFT JOIN departments ON departments.id = roles.department_id
                    WHERE e.role_id IN (SELECT id FROM roles WHERE department_id = ${departmentId})`;
            return db.promise().query(sql);
        })
        })
}

const viewBy = action => {
    if (action.includes('manager')) {
        return viewByManager()
    } else {
        return viewByDepartment()
    }
}

module.exports = { viewAll, viewBy } 