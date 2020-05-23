const mysql = require("mysql");
const cTable = require("console.table");
const inquirer = require("inquirer");
var connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",
        database: "employee_management_systemDB"
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
            });
        });
    }
    inquirer.prompt([])
});


