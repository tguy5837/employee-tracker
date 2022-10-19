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

// main menu function
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

// Get employees from db
const viewEmployees = async () => {
    // Join necessary columns from different tables so that all data is presented correctly
    const [employeeData] = await db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, department.name AS department_name, role.salary, employee.manager_id
                                            FROM employee
                                            INNER JOIN role ON employee.role_id = role.id
                                            INNER JOIN department ON role.id = department.id;`);

    // Display employee data
    console.table(employeeData);
    mainMenu();
};

// Get departments from db
const viewDepartments = async () => {
    const [departmentData] = await db.query('SELECT * FROM department');

    // Display department data
    console.table(departmentData);
    mainMenu();
};

// Get roles from db
const viewRoles = async () => {
    const [roleData] = await db.query(`SELECT role.id, role.title, role.salary, department.name AS department_name 
                                        FROM role 
                                        INNER JOIN department ON role.department_id = department.id`);

    // Display role data
    console.table(roleData);
    mainMenu();
};

const addEmployee = async () => {
    // Get role data for role choices
    const [roleData] = await db.query(`SELECT role.id AS value, role.title AS name FROM role;`);

    // Get manager names to make it easier to choose by name, not id
    const [managers] = await db.query(`SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS name, employee.id AS value FROM employee;`)
    managers.push({ name: 'None', value: 0 });

    return await prompt([
        {
            type: 'input',
            name: 'employeeFirstName',
            message: "What is the employee's first name?"
        },
        {
            type: 'input',
            name: 'employeeLastName',
            message: "What is the employee's last name?"
        },
        {
            type: 'input',
            name: 'employeeEmail',
            message: "What is the employee's email address?"
        },
        {
            type: 'list',
            name: 'employeeRole',
            message: "What is the employee's role?",
            choices: roleData
        },
        {
            type: 'list',
            name: 'employeeMgr',
            message: "Who is the employee's manager?",
            choices: managers
        }
    ])
        .then(async newEmployeeData => {
            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                            VALUES
                            (?,?,?,?)`;
            const params = [newEmployeeData.employeeFirstName, newEmployeeData.employeeLastName, newEmployeeData.employeeRole, newEmployeeData.employeeMgr];
            console.log(params);
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.log('Error')
                }
            });
            mainMenu();
        })
};

const addDepartment = async () => {
    return await prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'What would you like to name the new Department?'
        }
    ])
        .then(async newDepartmentName => {
            const sql = `INSERT INTO department (name)
                            VALUES (?)`;
            const param = [newDepartmentName.departmentName];
            db.query(sql, param, (err, result) => {
                if (err) {
                    console.log('Error')
                }
            });
            mainMenu();
        })
};

const addRole = async () => {
    // Get department data for department choices
    const [departmentData] = await db.query(`SELECT department.id AS value, department.name FROM department;`);

    return await prompt([
        {
            type: 'input',
            name: 'roleName',
            message: 'What is the name of the new role?'
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'What is the salary for this role?'
        },
        {
            type: 'list',
            name: 'roleDepartment',
            message: 'What department does this role belong to?',
            choices: departmentData
        }
    ])
        .then(async newRoleData => {
            const sql = `INSERT INTO role (title, salary, department_id)
                            VALUES (?,?,?)`;
            const params = [newRoleData.roleName, newRoleData.roleSalary, newRoleData.roleDepartment];
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.log('Error')
                }
            });
            mainMenu();
        })
};

const updateEmployeeRole = async () => {
    // Get employee data for employee selection
    const [employees] = await db.query(`SELECT CONCAT (employee.first_name, ' ', employee.last_name, ' - ', role.title) AS name, employee.id AS value
                                        FROM employee
                                        INNER JOIN role ON employee.role_id = role.id;`);

    const [roles] = await db.query(`SELECT CONCAT (role.title, ' - ', role.salary) AS name, role.id AS value
                                    FROM role;`);

    return await prompt([
        {
            type: 'list',
            name: 'employee',
            message: 'What employee would you like to update?',
            choices: employees
        },
        {
            type: 'list',
            name: 'role',
            message: 'What role does this employee now have?',
            choices: roles
        }
    ])
        .then(async updateData => {
            const sql = `UPDATE employee
                        SET role_id = ?
                        WHERE id = ?;`

            const params = [updateData.role, updateData.employee];
            console.log(params);
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.log('Error')
                }
            })
            mainMenu();
        });

};

mainMenu();