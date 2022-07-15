const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');
const viewInfo = require('./utils/viewFunctions');
const addDataInput = require('./utils/addFunctions');
const updateInfo = require('./utils/updateFunctions');
const deleteInfo = require('./utils/deleteFunctions');

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
        name: 'firstAction',
        message: 'What would you like to do?',
        choices: ['View', 'Add', 'Update', 'Delete', 'Exit the App']
    },
    {
        type: 'rawlist',
        name: 'secondAction',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'View All Roles', 'View All Departments',
            'View Employees by Manager', 'View Employees by Department', 'View the Total Utilized Budget By Department', 'Go Back to Previous Menu'],
        when: ({ firstAction }) => {
            if (firstAction === "View") {
                return true;
            } else {
                return false;
            }
        }
    },
    {
        type: 'rawlist',
        name: 'secondAction',
        message: 'What would you like to do?',
        choices: ['Add an Employee', 'Add a Role', 'Add a Department', 'Go Back to Previous Menu'],
        when: ({ firstAction }) => {
            if (firstAction === "Add") {
                return true;
            } else {
                return false;
            }
        }
    },
    {
        type: 'rawlist',
        name: 'secondAction',
        message: 'What would you like to do?',
        choices: ['Update Employee Role or Manager', 'Update Team Manager', 'Go Back to Previous Menu'],
        when: ({ firstAction }) => {
            if (firstAction === "Update") {
                return true;
            } else {
                return false;
            }
        }
    },
    {
        type: 'rawlist',
        name: 'secondAction',
        message: 'What would you like to do?',
        choices: ['Delete an Employee', 'Delete a Role', 'Delete a department'],
        when: ({ firstAction }) => {
            if (firstAction === "Delete") {
                return true;
            } else {
                return false;
            }
        }
    }
];

const actionHandler = answer => {
    if (answer.firstAction === 'Exit the App') {
        db.end((error) => {
            if(error) {
                console.log(error);
            }
            console.log("Disconnected to the employees_info database");
        });
        console.log('See You Again Soon!')
        process.exit(0);
    }
    action = answer.secondAction.toLowerCase();
    switch (true) {
        case (action.includes('view')):
            return viewInfo(action)
        case (action.includes('add')):
            return addDataInput(action);
        case (action.includes('update')):
            return updateInfo(action);
        case (action.includes('delete')):
            return deleteInfo(action);
        case (action === 'go back to previous menu'):
            let result = [""];
            return result;
    }
}

const actionMenu = () => {
    return inquirer.prompt(menu)
        .then(answer => {
            return actionHandler(answer);
        })
        .then(result => {
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