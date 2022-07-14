const inquirer = require('inquirer');
const viewAll = require('./utils/viewFunctions');
const addDataInput = require('./utils/addFunctions');

const title = () => {
    console.log(
        `
        ++++++++++++++++++
         EMPLOYEE MANAGER
        ++++++++++++++++++
    `
    )
};

const menu = [
    {
        type: 'rawlist',
        name: 'action',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'View All Roles', 'View All Departments', 'Add A Employee',
            'Add A Role', 'Add A Department', 'Update Employee Role']
    }
];

const actionHandler = answer => {
    const action = answer.action.toLowerCase();
    switch (true) {
        case (action.includes('view all')):
            return viewAll(action);
        case (action.includes('add a')):
            return addDataInput(action);
        case (action.includes('update')):
            console.log('s');
            break;
    }
}

const actionMenu = () => {
    return inquirer.prompt(menu)
        .then(answer => {
            return actionHandler(answer);
        })
        .then (result => {
            console.table(result[0]);
            actionMenu();
        })
        .catch(error => console.log(error));
}

const init = () => {
    title();
    actionMenu();
}

init();