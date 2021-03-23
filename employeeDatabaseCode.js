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
            'Add a department',
            'Add a role',
            // 'Remove an employee',
            'Update an employee role',
            'Update an employee manager',
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
            case 'Add a role':
                addRole();
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
     
// const managerSearch = () => {
//     inquirer.prompt({
//         name: 'manager',
//         type: 'input',
//         message: 'What manager would you like to search for?'
//     }).then((answer) => {
//         let query = 'SELECT employee.first_name, employee.last_name, role.title, role.salary FROM employee INNER JOIN department ON (employee.manager_id=department.id) INNER JOIN role ON (employee.role_id=role.id) WHERE (department.manager = ?)'
//         connection.query(query, [answer.manager, answer.manager], (err, res) => {
//             if (err) throw err;
//             console.table(res)
//             startSearch();
//         })
//     })
// };
const selectAll = (tableName) => {
    return new Promise((resolve) => {
        connection.query(`SELECT * FROM ${tableName}`, (err, res) => {
            if (err) throw err;
            resolve(res);
        })
    })
}

const addEmployee = async () => {
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
            type: 'rawlist',
            message: 'Pick a role',
            choices: roleArray,
        },
        {
            name: 'manager',
            type: 'rawlist',
            message: 'Manager: ',
            choices: managerArray,
        },
    ]).then((answer) => {
        console.log(answer);
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