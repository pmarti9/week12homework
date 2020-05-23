const mysql = require("mysql");
const cTable = require("console.table");
const inquirer = require("inquirer");
var connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",
        database: "company_db"
});
// var query = connection.query("SELECT * FROM employee", function(err, data) {
//     if (err) throw err;
//     console.table(data);
// });
function validateString(answer) {
    if (answer != "" && isNaN(parseInt(answer))) {
        return true;
    }
    return false;
}
function validateNumber(answer) {
    if (answer != "" && !isNaN(parseInt(answer))) {
        return true;
    }
    return false;
}
function continuePrompt() {
    inquirer.prompt([
        {
            type: "confirm",
            name: "continue",
            message: "Would you like to coninue?"
        }
    ]).then(function(data) {
        if (data.continue) {
            main();
        }
        else {
            return;
        }
    });
}
function main() {
    inquirer.prompt([
        {
            type: "list",
            name: "mainMenu",
            message: "Select an option:",
            choices: [
                "View All Employees",
                "View All Roles",
                "View All Departments",
                "Add An Employee",
                "Add A Role",
                "Add A Department",
                "Update Employee Role"
            ]
        }
    ]).then(function(answer) {
        switch (answer.mainMenu) {
            case "View All Employees":
                var query = connection.query("SELECT * FROM employee", function(err, data) {
                    if (err) throw err;
                    console.table(data);
                    continuePrompt();
                });
                break;
            case "Add A Role":
                var query = connection.query("SELECT id, department FROM department", function(err, data) {
                    if (err) throw err;
                    // let choices = data.map(x => `${x.id} - ${x.department}`);
                    let choices = [];
                    for (let i = 0; i < data.length; i++) {
                        choices.push(data[i].id + " - " + data[i].department);
                    }
                    inquirer.prompt([
                        {
                            type: "input",
                            name: "title",
                            message: "Enter the role name:",
                            validate: validateString
                        },
                        {
                            type: "input",
                            name: "salary",
                            message: "Enter the salary:",
                            validate: validateNumber
                        },
                        {
                            type: "list",
                            name: "department",
                            message: "Select the department:",
                            choices: [...choices]
                        }
                    ]).then(function(data) {
                        var arr = data.department.split(" ");
                        var deptID = parseInt(arr[0]);
                        var query = connection.query(`INSERT INTO role (title, salary, department_id) VALUES ('${data.title}', ${data.salary}, ${deptID})`, function(err, data) {
                            if (err) throw err;
                            continuePrompt();
                        });
                    });
                });
                break;
            case "Add A Department":
                inquirer.prompt([
                    {
                        type: "input",
                        name: "department",
                        message: "Enter the department's name:",
                        validate: validateString
                    }
                ]).then(function(data) {
                    var query = connection.query(`INSERT INTO department (department) VALUES ('${data.department}');`, function(err, data) {
                        if (err) throw err;
                        return data;
                        continuePrompt();
                });
            });
                break;
            case "Update Employee Role":
                const emp = {
                    first_name: "",
                    last_name: "",
                    role_id: 0,
                    manager_id: 0,
                    empID: 0
                };
                var query = connection.query("SELECT id, first_name, last_name FROM employee", function(err, data) {
                    if (err) throw err;
                    let choices = data.map(x => `${x.id} - ${x.first_name} ${x.last_name}`);
                    inquirer.prompt([
                        {
                            type: "list",
                            name: "employee",
                            message: "Select an employee:",
                            choices: [...choices]
                        }
                    ]).then(function(data) {
                        var arr = data.employee.split(" ");
                        emp.empID = parseInt(arr[0]);
                        inquirer.prompt([
                            {
                                type: "input",
                                name: "firstName",
                                message: "Enter the employee's first name:",
                                validate: validateString
                            },
                            {
                                type: "input",
                                name: "lastName",
                                message: "Enter the employee's last name:",
                                validate: validateString
                            }
                        ]).then(function(data) {
                            emp.first_name = data.firstName;
                            emp.last_name = data.lastName;
                            var query = connection.query("SELECT id, title FROM role", function(err, data) {
                                if (err) throw err;
                                let choices = data.map(x => `${x.id} - ${x.title}`);
                                inquirer.prompt([
                                    {
                                        type: "list",
                                        name: "title",
                                        message: "Select a title:",
                                        choices: [...choices]
                                    }
                                ]).then(function(data) {
                                    var arr = data.title.split(" ");
                                    emp.role_id = parseInt(arr[0]);
                                    var query = connection.query("SELECT id, first_name, last_name FROM employee", function(err, data) {
                                        if (err) throw err;
                                        let choices = data.map(x => `${x.id} - ${x.first_name} ${x.last_name}`);
                                        choices.push("This employee does not have a manager");
                                        inquirer.prompt([
                                            {
                                                type: "list",
                                                name: "manager",
                                                message: "Select this employee's manager:",
                                                choices: [...choices]
                                            }
                                        ]).then(function(data) {
                                            if (data.manager === "This employee does not have a manager") {
                                                emp.manager_id = null;
                                            }
                                            else {
                                                var arr = data.manager.split(" ");
                                                emp.manager_id = parseInt(arr[0]);
                                            }
                                            var query = connection.query(`UPDATE employee SET first_name = '${emp.first_name}', last_name = '${emp.last_name}', role_id = ${emp.role_id}, manager_id = ${emp.manager_id} WHERE id = ${emp.empID}`, function(err, data) {
                                                if (err) throw err;
                                                continuePrompt();
                                                return data;
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
                break;
        }
    });
}
main();