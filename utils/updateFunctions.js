const db = require('../db/connection');
const inquirer = require('inquirer');

const updateEmployeeRole = () => {
    let employeesInfo;
    let employees = [];
    let rolesInfo;
    let roles = [];
    let managersInfo;
    let managers = ['none'];
    let sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees`
    return db.promise().query(sql)
        .then(result => {
            employeesInfo = result[0];
            employeesInfo.map(element => employees.push(element.name));
            sql = `SELECT id, title FROM roles`
            return db.promise().query(sql);
        })
        .then(result => {
            rolesInfo = result[0];
            rolesInfo.map(element => roles.push(element.title));
            sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees WHERE manager_id is NULL`
            return db.promise().query(sql);
        })
        .then(result => {
            managersInfo = result[0];
            managersInfo.map(element => managers.push(element.name));
            return inquirer.prompt([
                {
                    type: 'rawlist',
                    name: 'name',
                    message: 'Whose role need to be updated?',
                    choices: employees
                },
                {
                    type: 'rawlist',
                    name: 'role',
                    message: 'What role is this employee now?',
                    choices: roles
                },
                {
                    type: 'confirm',
                    name: 'confirmManagerChange',
                    message: "Is this employee's manager changed?",
                    default: false
                },
                {
                    type: 'rawlist',
                    name: 'manager',
                    message: "Who is this employee's manager now?",
                    choices: managers,
                    when: ({ confirmManagerChange }) => {
                        if (confirmManagerChange) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            ])
                .then(answer => {
                    const employeeId = employeesInfo.filter(element => element.name === answer.name)[0].id;
                    const roleId = rolesInfo.filter(element => element.title === answer.role)[0].id;
                    if (answer.confirmManagerChange) {
                        if (answer.manager === 'none') {
                            sql = `UPDATE employees
                            SET role_id = ${roleId}, manager_id = NULL
                            WHERE id = ${employeeId}`;
                        } else {
                            const managerId = managersInfo.filter(element => element.name === answer.manager)[0].id;
                            sql = `UPDATE employees
                                SET role_id = ${roleId}, manager_id = ${managerId}
                                WHERE id = ${employeeId}`;
                        }
                    } else {
                        sql = `UPDATE employees
                                SET role_id = ${roleId}
                                WHERE id = ${employeeId}`;
                    }
                    db.query(sql, (err, result) => {
                        if (err) {
                            console.log(err.message)
                        }
                        console.log(`Updated ${answer.name}'s role to the database`);
                    })
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
                    WHERE e.id = ${employeeId}`;
                    
                    return db.promise().query(sql);
                })
        })
};

const updateTeamManager = () => {
    let managersInfo;
    let managers = [];
    let sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees WHERE manager_id is NULL`
    return db.promise().query(sql)
        .then(result => {
            managersInfo = result[0];
            managersInfo.map(element => managers.push(element.name));
            return inquirer.prompt([
                {
                    type: 'rawlist',
                    name: 'oldManager',
                    message: 'Which manager is changed?',
                    choices: managers
                },
                {
                    type: 'rawlist',
                    name: 'newManager',
                    message: 'Who is the new manager?',
                    choices: managers
                }
            ])
        })
        .then(answer => {
            oldManagerId = managersInfo.filter(element => element.name === answer.oldManager)[0].id;
            newManagerId = managersInfo.filter(element => element.name === answer.newManager)[0].id;
            sql = `UPDATE employees
                    SET manager_id = ${newManagerId}
                    WHERE manager_id = ${oldManagerId}`
            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(`Manager ${answer.newManager} is updated to the database.`)
            })
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
            WHERE e.manager_id = ${newManagerId}`
            return db.promise().query(sql);
        })
}

const updateInfo = action => {
    if (action === 'update employee role') {
        return updateEmployeeRole();
    } else if (action === 'update team manager') {
        return updateTeamManager();
    }
};

module.exports = updateInfo;