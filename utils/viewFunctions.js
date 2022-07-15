const inquirer = require('inquirer');
const db = require('../db/connection');
const { employeeSql, roleSql } = require('../helpers/sql');

// view all departments or roles or employees
const viewAll = action => {
    const content = action.split(" ")[2];
    let sql = '';
    if (content === 'departments') {
        sql = `SELECT * FROM departments`
    } else if (content === 'roles') {
        sql = roleSql;
    } else if (content === 'employees') {
        sql = employeeSql              
    }
    return db.promise().query(sql);
};

// view by manager or by department
const viewByElement = (action) => {
    const element = action.split(' ')[3];
    let info;
    let elements = [];
    let sql;
    if (element === 'manager') {
        sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees 
                    WHERE id IN (SELECT DISTINCT manager_id FROM employees)
                    ORDER BY first_name`;
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
                sql = employeeSql + ` WHERE e.manager_id = ${id}`;
            } else {
                sql = employeeSql + ` WHERE e.role_id IN (SELECT id FROM roles WHERE department_id = ${id})`;
            }
            return db.promise().query(sql);
        })
    })
};

// view the total budget by department
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

// handle user's choice
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