const db = require('../db/connection');
const inquirer = require('inquirer');
const { employeeSql } = require('../helpers/sql');

const updateEmpRoleorManager = () => {
    let employeesInfo;
    let employees = [];
    let rolesInfo;
    let roles = [];
    let managers = ['none'];
    let sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees
                ORDER BY first_name`
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
            employees.map(element => managers.push(element));
            return inquirer.prompt([
                {
                    type: 'rawlist',
                    name: 'name',
                    message: 'Whose role need to be updated?',
                    choices: employees
                },
                {
                    type: 'confirm',
                    name: 'confirmRoleChange',
                    message: "Is this employee's role changed?",
                },
                {
                    type: 'rawlist',
                    name: 'role',
                    message: 'What role is this employee now?',
                    choices: roles,
                    when: ({ confirmRoleChange }) => {
                        if (confirmRoleChange) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                },
                {
                    type: 'confirm',
                    name: 'confirmManagerChange',
                    message: "Is this employee's manager changed?",
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
                    if (answer.manager && answer.manager !== 'none') {
                        var managerId = employeesInfo.filter(element => element.name === answer.manager)[0].id;
                    }
                    if (answer.role) {
                        var roleId = rolesInfo.filter(element => element.title === answer.role)[0].id;
                    }
                    if (answer.manager === 'none') {
                        sql = `UPDATE employees
                            SET role_id = ${roleId}, manager_id = NULL
                            WHERE id = ${employeeId}`;
                    } else if (answer.role && answer.manager) {
                        sql = `UPDATE employees
                                SET role_id = ${roleId}, manager_id = ${managerId}
                                WHERE id = ${employeeId}`;
                    } else if (!answer.role && answer.manager) {
                        sql = `UPDATE employees
                            SET manager_id = ${managerId}
                            WHERE id = ${employeeId}`;
                    } else if (answer.role&& !answer.manager) {
                        sql = `UPDATE employees
                                SET role_id = ${roleId}
                                WHERE id = ${employeeId}`;
                    } else {
                        const result = ['No data has been changed'];
                        return result;
                    }

                    db.query(sql, (err, result) => {
                        if (err) {
                            console.log(err.message)
                        }
                        console.log(`Updated ${answer.name}'s role to the database`);
                    })
                    sql = employeeSql + ` WHERE e.id = ${employeeId}`;
                    return db.promise().query(sql);
                })
        })
};


const updateTeamManager = () => {
    let managersInfo;
    let managers = [];
    let employeesInfo;
    let employees = [];
    let sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees 
                WHERE id IN (SELECT DISTINCT manager_id FROM employees)`;
    return db.promise().query(sql)
        .then(result => {
            managersInfo = result[0];
            managersInfo.map(element => managers.push(element.name));
            sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees
                    ORDER BY first_name`
            return db.promise().query(sql)
        })
        .then(result => {
            employeesInfo = result[0];
            employeesInfo.map(element => employees.push(element.name));
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
                    choices: employees
                }
            ])
        })
        .then(answer => {
            oldManagerId = managersInfo.filter(element => element.name === answer.oldManager)[0].id;
            newManagerId = employeesInfo.filter(element => element.name === answer.newManager)[0].id;
            sql = `UPDATE employees
                    SET manager_id = ${newManagerId}
                    WHERE manager_id = ${oldManagerId}`
            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(`Manager ${answer.newManager} is updated to the database.`)
            })
            sql = employeeSql + ` WHERE e.manager_id = ${newManagerId}`
            return db.promise().query(sql);
        })
}

const updateInfo = action => {
    if (action === 'update employee role or manager') {
        return updateEmpRoleorManager();
    } else if (action === 'update team manager') {
        return updateTeamManager();
    }
};

module.exports = updateInfo;