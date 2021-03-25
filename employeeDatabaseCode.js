const mysql = require('mysql');
const inquirer = require('inquirer');

require('dotenv').config();

// creates connection and hides personal info
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
            'Add an employee',
            'Add a department',
            'Add a role',
            'Update an employee role',
            'Exit',
        ],
    }).then((answer) => {
        switch (answer.action) {
            case 'View all employees':
                employeeSearch();
                break;
            case 'View all employees by department':
                departmentSearch();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateRole();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Exit':
                break;
            default:
                console.log(`Invalid: ${answer.action}`);
                break;
        }
    });
};

// creates a display table with all employee data from the three different tables
const employeeSearch = () => {
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, department.name AS department, role.title AS title, role.salary, employee.manager_id AS manager, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON (employee.role_id=role.id) LEFT JOIN department ON (role.department_id=department.id) LEFT JOIN employee manager ON (manager.id = employee.manager_id)', (err, res) => {
        if (err) throw err;
        console.table(res);
        startSearch();
    })
}

const departmentSearch = async () => {
    // finds all the departments in the department table and puts them into an array with the names displayed and the id stored
    const allDepartments = await selectAll('department')
    const departmentArray = allDepartments.map(function(department){
        return {
            name: department.name,
            value: department.id,
        }
    })
    inquirer.prompt({
        name: 'department',
        type: 'rawlist',
        message: 'Which department would you like to view?',
        choices: departmentArray,

    }).then((answer) => {
        let query = 'SELECT employee.first_name, employee.last_name, role.title AS title, role.salary, department.name FROM employee JOIN role ON (employee.role_id=role.id) JOIN department ON (role.department_id=department.id) WHERE (department.id = ?)'
        connection.query(query, [answer.department, answer.department], (err, res) => {
            if (err) throw err;
            console.table(res)
            startSearch();
        })
    })
};

// used to access different tables and help retrieve data
const selectAll = (tableName) => {
    return new Promise((resolve) => {
        connection.query(`SELECT * FROM ${tableName}`, (err, res) => {
            if (err) throw err;
            resolve(res);
        })
    })
}

const addEmployee = async () => {
    // creates arrays for roles and employees 
    const allRoles = await selectAll('role')
    const allManagers = await selectAll('employee')
    const roleArray = allRoles.map(function(role){
        return {
            name: role.title,
            value: role.id,
        }
    })
    
    const managerArray = allManagers.map(function(managers){
        const fullName = managers.first_name + " " + managers.last_name;
        return {
            name: fullName,
            value: managers.id,
            short: fullName,
        }
    })    
    
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
            type: 'list',
            message: 'Pick a role',
            choices: roleArray,
        },
        // not all employees have a manager
        {
            name: 'confirm',
            type: 'confirm',
            message: 'Does this employee have a manager?',
            default: true,
        },
        {
            name: 'manager',
            type: 'list',
            message: 'Manager: ',
            choices: managerArray,
            when: (answer) => answer.confirm === true,
        },
    ]).then((answer) => {
        // add the info from the questions into the employee table
        connection.query(
            'INSERT INTO employee SET ?',
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: answer.role,
                manager_id: answer.manager,
            },
            (err) => {
                if (err) throw err;
                console.log('Successfully added employee');
                startSearch();
            }
        );
    });
};
              
const updateRole = async () => {
    // create array for employees and roles
    const allRoles = await selectAll('role')
    const allEmployees = await selectAll('employee')
    const roleArray = allRoles.map(function(role){
        return {
            name: role.title,
            value: role.id,
        }
    })

    const employeeArray = allEmployees.map(function(employee){
        const fullName = employee.first_name + " " + employee.last_name;
        return {
            name: fullName,
            value: employee.id,
        }
    })
    
    inquirer.prompt([
        {
            name: 'employee',
            type: 'list',
            message: 'Which employee would you like to update?',
            choices: employeeArray,
        },
        {
            name: 'role',
            type: 'list',
            message: "What is the employee's updated role?",
            choices: roleArray,
        },
    ]).then((answer) => {
        // edit current data with updated role
        let query = 'UPDATE employee SET role_id = ? WHERE id = ?'
        connection.query(query, [answer.role, answer.employee], (err, res) => {
            if (err) throw err;
            console.table(res)
            startSearch();
        })
    })
};
              
const addDepartment = () => {
    inquirer.prompt([
        {
            name: 'department',
            type: 'input',
            message: 'Department name: ',
        },
    ]).then((answer) => {
        connection.query(
            'INSERT INTO department SET ?',
            {
                name: answer.department,
            },
            (err) => {
                if (err) throw err;
                console.log('Successfully added a new department');
                startSearch();
            }
        );
    });
};

const addRole = async () => {
    // create array to store name of all departments
    const allDepartments = await selectAll('department')
    const departmentArray = allDepartments.map(function(department){
        return {
            name: department.name,
            value: department.id,
        }
    })
    inquirer.prompt([
        {
            name: 'role',
            type: 'input',
            message: 'Title: ',
        },
        {
            name: 'salary',
            type: 'number',
            message: 'Salary: ',
        },
        {
            name: 'department',
            type: 'rawlist',
            message: 'Select the department where this role will work: ',
            choices: departmentArray,
        },
    ]).then((answer) => {
        connection.query(
            'INSERT INTO role SET ?',
            {
                title: answer.role,
                salary: answer.salary,
                department_id: answer.department,
            },
            (err) => {
                if (err) throw err;
                console.log('Successfully added a new role');
                startSearch();
            }
        )
    })
}