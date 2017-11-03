//Setting up dependencies
//==============================================================================================================
const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');

//Creating connection and entering DB info
//==============================================================================================================
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazonDB"
});


//Setting up object to hold app logic
//==============================================================================================================
const bamazonSupervisor = {
  viewProdSales: function() {
    //function that joins the products and departments tables to display the product sales by department
    let query = `SELECT departments.department_id,departments.department_name,departments.over_head_costs,`;
    query += `products.product_sales FROM departments LEFT JOIN products ON departments.department_name`;
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
  //function to add a new department and a new product
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
      },
      {
        name: 'item_name',
        type: 'input',
        message: 'What is the item you would like to add?'
      },
      {
        name: 'price',
        type: 'input',
        message: 'How much should the item cost?'
      },
      {
        name: 'stock',
        type: 'input',
        message: 'How much stock is there of this item?'
      }
    ]).then(function(ans) {
      connection.query('INSERT INTO departments SET ?',
      {
        department_name: ans.name,
        over_head_costs: ans.costs
      }, function(err, res){
      });
      connection.query('INSERT INTO products SET ?',
      {
        product_name: ans.item_name,
        department_name: ans.name,
        price: ans.price,
        stock_quantity: ans.stock
      }, function(err, res) {
        console.log(`You've added a department!`);
        bamazonSupervisor.start();
      });
    });
  },
  //function to run the app and switch cases to send the supervisor to the different functions
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

//Creating a connection and then invoking the function to start the app
//==============================================================================================================
connection.connect(function(err) {
  if (err) throw err;
  bamazonSupervisor.start();
});
