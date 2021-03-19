const mysql = require('mysql');
const inquirer = require('inquirer');

require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

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
            // case 'Remove an employee':
            //     removeEmployee();
            //     break;
            // case 'Update an employee role':
            //     updateRole();
            //     break;
            // case 'Update an employee manager':
            //     updateManager();
            //     break;
            case 'Add a department':
                addDepartment();
                break;
            default:
                console.log(`Invalid: ${answer.action}`);
                break;
        }
    });
};

const employeeSearch = () => {
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, department.name, department.manager, role.title, role.salary FROM employee INNER JOIN department ON (employee.manager_id=department.id) INNER JOIN role ON (employee.role_id=role.id)', (err, res) => {
        if (err) throw err;
        console.table(res);
        startSearch();
    })
}

const departmentSearch = () => {
    inquirer.prompt({
        name: 'department',
        type: 'input',
        message: 'What department would you like to search for?'
    }).then((answer) => {
        let query = 'SELECT employee.first_name, employee.last_name, role.title, role.salary FROM employee INNER JOIN department ON (employee.manager_id=department.id) INNER JOIN role ON (employee.role_id=role.id) WHERE (department.name = ?)'
        connection.query(query, [answer.department, answer.department], (err, res) => {
            if (err) throw err;
            console.table(res)
            startSearch();
        })
    })
};
     
const managerSearch = () => {
    inquirer.prompt({
        name: 'manager',
        type: 'input',
        message: 'What manager would you like to search for?'
    }).then((answer) => {
        let query = 'SELECT employee.first_name, employee.last_name, role.title, role.salary FROM employee INNER JOIN department ON (employee.manager_id=department.id) INNER JOIN role ON (employee.role_id=role.id) WHERE (department.manager = ?)'
        connection.query(query, [answer.manager, answer.manager], (err, res) => {
            if (err) throw err;
            console.table(res)
            startSearch();
        })
    })
};
               
const addEmployee = () => {
    inquirer.prompt([
        {
            name: 'firstName',
            type: 'input',
            message: 'First name: ',
        },
        {
            name: 'lastName',
            type: 'input',
            message: 'Last name: ',
        },
        {
            name: 'role',
            type: 'input',
            message: 'Role: ',
        },
        {
            name: 'department',
            type: 'input',
            message: 'Department: ',
        },
        {
            name: 'manager',
            type: 'input',
            message: 'Manager: ',
        },
    ]).then((answer) => {
        connection.query(
            'INSERT INTO employee SET ?',
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
            },
            // 'INSERT INTO role SET ?',
            // {
            //     title: answer.role,
            // },
            // 'INSERT INTO department SET ?',
            // {
            //     name: answer.department,
            //     manager: answer.manager,
            // },
            (err) => {
                if (err) throw err;
                console.log('Successfully added employee');
                startSearch();
            }
        );
    });
};
               
// removeEmployee();
              
// updateRole();
              
// updateManager();

const addDepartment = () => {
    inquirer.prompt([
        {
            name: 'department',
            type: 'input',
            message: 'Department name: ',
        },
        {
            name: 'manager',
            type: 'input',
            message: 'Manager name',
        }
    ]).then((answer) => {
        connection.query(
            'INSERT INTO department SET ?',
            {
                name: answer.department,
                manager: answer.manager,
            }
        )
    })
};