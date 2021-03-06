const db = require('../db/connection');
const inquirer = require('inquirer');
const { employeeSql, roleSql } = require('../helpers/sql');

// add new department to the database
const addDepartment = () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: `What is the new department's name?`,
            validate: name => {
                if (name) {
                    return true;
                } else {
                    console.log(`Please enter the new deparment's name!`);
                    return false;
                }
            }
        }
    ])
        .then(answer => {
            const name = answer.name[0].toUpperCase() + answer.name.substring(1);
            console.log(name)
            sql = `INSERT INTO departments (name)
                    VALUES ('${name}')`
            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(`Added ${name} to the database`);
            });
            return db.promise().query(`SELECT * FROM departments ORDER BY id DESC LIMIT 1`);
        })
};

// add new role title to the database including salary
const addRole = () => {
    let departmentsInfo
    let department = [];
    return db.promise().query('SELECT * FROM departments')
        .then(result => {
            departmentsInfo = result[0]
            departmentsInfo.map(element => department.push(element.name));
            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: `What is the new role's title?`,
                    validate: name => {
                        if (name) {
                            return true;
                        } else {
                            console.log(`Please enter the new role's title!`);
                            return false;
                        }
                    }
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: "What is the salary of this role?",
                    validate: (salary) => {
                        if (isNaN(salary)) {
                            return "please enter a number";
                        }
                        return true;
                    },
                },
                {
                    type: 'rawlist',
                    name: 'department',
                    message: 'What department does this role belong to?',
                    choices: department
                }
            ])
        })
        .then(answer => {
            const name = answer.name.split(" ").map(element => element[0].toUpperCase() + element.substring(1)).join(" ");
            const departmentId = departmentsInfo.filter(element => element.name === answer.department)[0].id;
            sql = `INSERT INTO roles (title, salary, department_id)
                        VALUES ('${name}', '${answer.salary}', ${departmentId})`;
            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(`Added ${name} to the database`);
            });

            sql = roleSql + ` ORDER BY id DESC LIMIT 1`
            return db.promise().query(sql);
        });
};

// add a new employee to the database including role and manager
const addEmployee = () => {
    let sql = 'SELECT id, title FROM roles';
    let rolesInfo;
    let roles = [];
    let managersInfo;
    let managers = ['none']
    return db.promise().query(sql)
        .then(result => {
            rolesInfo = result[0]
            rolesInfo.map(element => roles.push(element.title));
            sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees
                    ORDER BY first_name`;
            return db.promise().query(sql)
        })
        .then(result => {
            managersInfo = result[0];
            managersInfo.map(element => managers.push(element.name));
            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: `What is the new employee's first name?`,
                    validate: name => {
                        if (name) {
                            return true;
                        } else {
                            console.log(`Please enter the new employee's first name!`);
                            return false;
                        }
                    }
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: `What is the new employee's last name?`,
                    validate: name => {
                        if (name) {
                            return true;
                        } else {
                            console.log(`Please enter the new employee's last name!`);
                            return false;
                        }
                    }
                },
                {
                    type: 'rawlist',
                    name: 'role',
                    message: 'What role does this employee belong to?',
                    choices: roles
                },
                {
                    type: 'rawlist',
                    name: 'manager',
                    message: "Who is this employee's manager?",
                    choices: managers
                }
            ])
        })
        .then(answer => {
            const firstName = answer.firstName[0].toUpperCase() + answer.firstName.substring(1);
            const lastName = answer.lastName[0].toUpperCase() + answer.lastName.substring(1);
            const roleId = rolesInfo.filter(element => element.title === answer.role)[0].id;
            if (answer.manager === 'none') {
                sql = `INSERT INTO employees (first_name, last_name, role_id)
                VALUES ('${firstName}', '${lastName}', ${roleId})`;
            } else {
                const managerId = managersInfo.filter(element => element.name === answer.manager)[0].id;
                sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                VALUES ('${firstName}', '${lastName}', ${roleId}, ${managerId})`;
            }
            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(`Added ${firstName} ${lastName} to the database`);
            });
            sql = employeeSql + ` ORDER BY id DESC LIMIT 1`
            return db.promise().query(sql);
        })
}

// according to user's choice, get into different function
const addDataInput = action => {
    const content = action.split(" ")[2];
    if (content === 'department') {
        return addDepartment();
    } else if (content === 'role') {
        return addRole();
    } else {
        return addEmployee();
    }
}

module.exports = addDataInput;