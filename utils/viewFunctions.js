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

const viewByElement = (action) => {
    const element = action.split(' ')[3];
    let info;
    let elements = [];
    let sql;
    if (element === 'manager') {
        sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees 
                    WHERE id IN (SELECT DISTINCT manager_id FROM employees)`;
    } else {
        sql = `SELECT * FROM departments`;
    }

    return db.promise().query(sql)
        .then(result => {
            info = result[0];
            info.map(element => elements.push(element.name));
            return inquirer.prompt([
                {
                    type: 'rawlist',
                    name: 'element',
                    message: `Which ${element}'s team members would you like to view?`,
                    choices: elements
                }
            ])
        .then(answer => {
            const id = info.filter(element => element.name === answer.element)[0].id;
            if (element === 'manager') {
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
                    WHERE e.manager_id = ${id}`;
            } else {
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
                        WHERE e.role_id IN (SELECT id FROM roles WHERE department_id = ${id})`;
            }
            return db.promise().query(sql);
        })
    })
};

const viewTheBudget = () => {
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
                    message: "Which department's total utilized budget would you like to view?",
                    choices: departments
                }
            ])        
        })
        .then(answer => {
            const departmentId = departmentsInfo.filter(element => element.name === answer.department)[0].id;
            sql = `SELECT departments.name AS department, SUM (roles.salary) AS total_budget
                    FROM departments
                    LEFT JOIN roles ON departments.id = roles.department_id
                    LEFT JOIN employees ON employees.role_id = roles.id
                    WHERE departments.id = ${departmentId}`;
            return db.promise().query(sql);
        })
};

const viewInfo = action => {
    if (action.includes('view all')) {
        return viewAll(action);
    } else if (action.includes('view employees by')) {
        return viewByElement(action);
    } else {
        return viewTheBudget()
    }
};

module.exports = viewInfo; 