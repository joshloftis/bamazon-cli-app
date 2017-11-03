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
const bamazonManager = {
  //function to retrieve all of the data from the products table
  retrieveAllDb: function(cb) { //function that selects all from the db
    connection.query('SELECT * FROM products', function(err, res){
      if (err) throw err;
      let table = new Table({
        head: ['Item ID', 'Product Name', 'Department Name', 'Price', '# In Stock'],
        colWidths: [17, 17, 17, 17, 17]
      });
      for (let i of res) {
        table.push([i.item_id, i.product_name, i.department_name, i.price, i.stock_quantity]);
      }
      console.log(table.toString());
      bamazonManager.start();
    });
  },
  //function to retrieve all of the data with quantities less than 5
  lowInventory: function() {
    connection.query('SELECT * FROM products WHERE stock_quantity < 5', function(err, res){
      if (err) throw err;
      let table = new Table({
        head: ['Item ID', 'Product Name', 'Department Name', 'Price', '# In Stock'],
        colWidths: [17, 17, 17, 17, 17]
      });
      for (let i of res) {
        table.push([i.item_id, i.product_name, i.department_name, i.price, i.stock_quantity]);
      }
      console.log(table.toString());
      bamazonManager.start();
    });
  },
  //function allowing the manager to add stock to a product
  addInventory: function() {
    connection.query('SELECT * FROM products', function(err, res) {
      inquirer.prompt([
        {
          name: "choice",
          type: "list",
          choices: function() {
            let choiceArray = [];
            for (let i of res) {
              choiceArray.push(i.product_name);
            }
            return choiceArray;
          },
          message: "Choose an item to which to add stock."
        },
        {
          name: 'quantity',
          type: 'input',
          message: 'How many would you like to add?'
        }
      ]).then(function(ans){
        let chosenItem;
        let currQuant;
        let newQuant;
        let prodName;
        for (let i of res) {
          if (i.product_name === ans.choice) {
            prodName = i.product_name;
            chosenItem = i.item_id;
            currQuant = parseFloat(i.stock_quantity);
          }
        }
        newQuant = parseFloat(ans.quantity) + currQuant;
        connection.query('UPDATE products SET ? WHERE ?', [{stock_quantity: newQuant}, {item_id: chosenItem}], function(err, res){
          if (err) throw err;
          console.log(`You've updated ${prodName} to have a stock quantity of ${newQuant}.`);
        });
        bamazonManager.start();
      });
    });
  },
  //function to allow the manager to add a new product
  addNew: function() {
    inquirer.prompt([
      {
        name: 'name',
        type: 'input',
        message: 'What is the item you would like to add?'
      },
      {
        name: 'department',
        type: 'input',
        message: 'To what deparment should this item be added?',
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
      connection.query('INSERT INTO products SET ?',
      {
        product_name: ans.name,
        department_name: ans.department,
        price: ans.price,
        stock_quantity: ans.stock
      }, function(err, res){
        console.log(`You've added a product!`);
        bamazonManager.start();
      });
    });
  },
  //function to start the app and switch cases to invoke the correct functions
  start: function() {
    inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        choices: ['See all inventory', 'See low inventory', 'Add stock for a product', 'Add a new product', 'Quit'],
        message: 'What would you like to do?'
      }
    ]).then(function(ans){
      switch (ans.action) {
        case ('See all inventory'):
          return bamazonManager.retrieveAllDb();
        case ('See low inventory'):
          return bamazonManager.lowInventory();
        case ('Add stock for a product'):
          return bamazonManager.addInventory();
        case ('Add a new product'):
          return bamazonManager.addNew();
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
  bamazonManager.start();
});
