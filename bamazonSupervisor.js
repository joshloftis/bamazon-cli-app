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
  start: function() {
    inquirer.prompt([
      {
        name: 'choice',
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View Product Sales by Department', 'Add New Department']
      }
    ]).then(function(ans){
      switch (ans.choice) {
        case ('View Product Sales by Department'):
          return viewProdSales();
        case ('Add New Department'):
          return addDept();
      }
    });
  },
  viewProdSales: function() {
    let query = `
    SELECT
      departments.department_id,
      departments.department_name,
      departments.over_head_costs,
      products.product_sales
    FROM departments
    INNER JOIN products ON departments.department_name = products.department_name`;
    connection.query(query, function(err, res) {
      if (err) throw err;
      let table = new Table({
        head: ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit'],
        colWidths: [20, 20, 20, 20, 20]
      });
      for (let j of res) {
        let totalProfit = j.product_sales - j.over_head_costs;
        table.push([j.department_id, j.department_name, j.over_head_costs, j.product_sales, totalProfit]);
      }
      console.log(table);
      console.log(table.toString());
    });
    connection.end();
  }
};

bamazonSupervisor.viewProdSales();
