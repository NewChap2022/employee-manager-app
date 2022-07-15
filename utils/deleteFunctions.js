const inquirer = require("inquirer");
const db = require("../db/connection");

const deleteInfo = (action) => {
    const element = action.split(" ")[2];
    let info;
    let elements = [];
    let sql;
    if (element === 'employee') {
        sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees`;
    } else if (element === 'role') {
        sql = `SELECT id, title AS name FROM roles`;
    } else {
        sql = `SELECT id, name FROM departments`
    }

    return db.promise().query(sql)
    .then(result => {
        info = result[0];
        info.map(element => elements.push(element.name));
        return inquirer.prompt([
            {
                type: 'rawlist',
                name: 'element',
                message: `Which ${element} need to be deleted?`,
                choices: elements
            }
        ])
    })
    .then(answer => {
        const id = info.filter(element => element.name === answer.element)[0].id;
        if (element === 'employee') {
            sql = `DELETE FROM employees WHERE id = ${id}`;
        } else if (element === 'role') {
            sql = `DELETE FROM roles WHERE id = ${id}`;
        } else {
            sql = `DELETE FROM departments WHERE id = ${id}`;
        }
        
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err.message);
            }
        });
        const message = [`${answer.element} has been deleted from the database`];
        return message;
    })
};

module.exports = deleteInfo;