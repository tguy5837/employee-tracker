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
                    name: 'View All Departments',
                    value: 'VIEW_DEPARTMENTS'
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
        case 'VIEW_DEPARTMENT':
            viewDepartments();
            break;
        case 'EXIT':
            // do something
            break;
        default:
            process.exit();
    }
};

const viewEmployees = async () => {
    const [employeeData] = await db.query('SELECT * FROM employee;');
    console.table(employeeData);
};
const viewDepartments = () => {

};

mainMenu();