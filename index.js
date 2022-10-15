const { prompt } = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: '',
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
).promise();

const mainMenu = async () => {
    const { choice } = await prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: [
                {
                    name: 'View All Employees',
                    value: 'VIEW_EMPLOYEES'
                },
                {
                    name: 'View All Roles',
                    value: 'VIEW_ROLES'
                },
                {
                    name: 'View All Departments',
                    value: 'VIEW_DEPARTMENT'
                },
                {
                    name: 'Add an Employee',
                    value: 'ADD_EMPLOYEE'
                },
                {
                    name: 'Add a Role',
                    value: 'ADD_ROLE'
                },
                {
                    name: 'Add a Department',
                    value: 'ADD_DEPARTMENT'
                },
                {
                    name: 'Update Employee Role',
                    value: 'UPDATE_EMPLOYEE_ROLE'
                },
                {
                    name: 'Exit',
                    value: 'EXIT'
                }
            ]
        }
    ]);

    switch (choice) {
        case 'VIEW_EMPLOYEES':
            viewEmployees();
            break;
        case 'VIEW_ROLES':
            viewRoles();
            break;
        case 'VIEW_DEPARTMENT':
            viewDepartments();
            break;
        case 'ADD_EMPLOYEE':
            addEmployee();
            break;
        case 'ADD_ROLE':
            addRole();
            break;
        case 'ADD_DEPARTMENT':
            addDepartment();
            break;
        case 'UPDATE_EMPLOYEE_ROLE':
            updateEmployeeRole();
            break;
        case 'EXIT':
            process.exit();
        default:
            process.exit();
    }
};

const viewEmployees = async () => {
    const [employeeData] = await db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, department.name AS department_name, role.salary, employee.manager_id
                                            FROM employee
                                            INNER JOIN role ON employee.role_id = role.id
                                            INNER JOIN department ON role.id = department.id;`);
    console.table(employeeData);
    mainMenu();
};

const viewDepartments = async () => {
    const [departmentData] = await db.query('SELECT * FROM department');
    console.table(departmentData);
    mainMenu();
};

const viewRoles = async () => {
    const [roleData] = await db.query(`SELECT role.id, role.title, role.salary, department.name AS department_name 
                                        FROM role 
                                        INNER JOIN department ON role.department_id = department.id`);
    console.table(roleData);
    mainMenu();
};

const addEmployee = async () => {
    //
}

mainMenu();