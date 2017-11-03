const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazonDB"
});

const bamazonSupervisor = {
  viewProdSales: function() {
    let query = `SELECT departments.department_id,departments.department_name,departments.over_head_costs,`;
    query += `products.product_sales FROM departments INNER JOIN products ON departments.department_name`;
    query += ` = products.department_name`;
    connection.query(query, function(err, res) {
      if (err) throw err;
      let table = new Table({
        head: ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit'],
        colWidths: [17, 17, 17, 17, 17]
      });
      for (let j of res) {
        let totalProfit = j.product_sales - j.over_head_costs;
        table.push([j.department_id, j.department_name, j.over_head_costs, j.product_sales, totalProfit]);
      }
      console.log(table.toString());
    });
    setTimeout(function() {
      bamazonSupervisor.start();
    }, 100);
  },
  addDept: function() {
    inquirer.prompt([
      {
        name: 'name',
        type: 'input',
        message: 'What is the department you would like to add?'
      },
      {
        name: 'costs',
        type: 'input',
        message: 'What are the overhead costs for this department?',
      }
    ]).then(function(ans) {
      connection.query('INSERT INTO departments SET ?',
      {
        department_name: ans.name,
        over_head_costs: ans.costs
      }, function(err, res){
        console.log(`You've added a department!`);
        bamazonSupervisor.start();
      });
    });
  },
  start: function() {
    inquirer.prompt([
      {
        name: 'choice',
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View Product Sales by Department', 'Add New Department', 'Quit']
      }
    ]).then(function(ans){
      switch (ans.choice) {
        case ('View Product Sales by Department'):
          return bamazonSupervisor.viewProdSales();
        case ('Add New Department'):
          return bamazonSupervisor.addDept();
        case ('Quit'):
          return connection.end();
      }
    });
  }
};
bamazonSupervisor.start();
