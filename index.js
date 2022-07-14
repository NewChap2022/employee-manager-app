const inquirer = require('inquirer');
const cTable = require('console.table')
const { viewAll, viewBy } = require('./utils/viewFunctions');
const addDataInput = require('./utils/addFunctions');
const updateInfo = require('./utils/updateFunctions');
const db = require('./db/connection');

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
        choices: ['View', 'Add', 'Update', 'Exit the App']
    },
    {
        type: 'rawlist',
        name: 'secondAction',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'View All Roles', 'View All Departments',
            'View Employees by Manager', 'View Employees by Department', 'Go Back to Previous Menu'],
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
        choices: ['Add A Employee', 'Add A Role', 'Add A Department', 'Go Back to Previous Menu'],
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
        choices: ['Update Employee Role', 'Update Team Manager', 'Go Back to Previous Menu'],
        when: ({ firstAction }) => {
            if (firstAction === "Update") {
                return true;
            } else {
                return false;
            }
        }
    }
];

const actionHandler = answer => {
    console.log(answer.firstAction);
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
        case (action.includes('view all')):
            return viewAll(action);
        case (action.includes('view employees by')):
            return viewBy(action);
        case (action.includes('add a')):
            return addDataInput(action);
        case (action.includes('update')):
            return updateInfo(action);
        case (action === 'go back to previous menu'):
            let result = [""]
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