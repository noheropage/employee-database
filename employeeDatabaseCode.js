const mysql = require('mysql');
const inquirer = require('inquirer');
const Sequelize = require('sequelize');
require('dotenv').config();

// const connection = mysql.createConnection({
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: 'localhost',
//     dialect: 'mysql',
//     port: 3306
//   }
// });

connection.connect((err) => {
    if (err) throw err;
    startSearch();
});

const startSearch = () => {
    inquirer.prompt({
        name: 'action',
        type: 'rawlist',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'View all employees by department',
            'View all employees by manager',
            'Add an employee',
            'Remove an employee',
            'Update an employee role',
            'Update an employee manager',
            'Add a department',
        ],
    }).then((answer) => {
        switch (answer.action) {
            case 'View all employees':
                employeeSearch();
                break;
            case 'View all employees by department':
                departmentSearch();
                break;
            case 'View all employees by manager':
                managerSearch();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Remove an employee':
                removeEmployee();
                break;
            case 'Update an employee role':
                updateRole();
                break;
            case 'Update an employee manager':
                updateManager();
                break;
            case 'Add a department':
                addDepartment();
                break;
            default:
                console.log(`Invalid: ${answer.action}`);
                break;
        }
    });
};

