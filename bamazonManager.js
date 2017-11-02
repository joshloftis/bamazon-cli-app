const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazonDB"
});

const bamazonManager = {
  retrieveAllDb: function(cb) { //function that selects all from the db
    connection.query('SELECT * FROM products', function(err, res){
      if (err) throw err;
      for (let i of res) {
        console.log(`ID: ${i.item_id} | Product: ${i.product_name} | Department: ${i.department_name} | Price: ${i.price} | In-stock: ${i.stock_quantity}`);
      }
      bamazonManager.start();
    });
  },
  lowInventory: function() {
    connection.query('SELECT * FROM products WHERE stock_quantity < 5', function(err, res){
      if (err) throw err;
      for (let i of res) {
        console.log(`ID: ${i.item_id} | Product: ${i.product_name} | Department: ${i.department_name} | Price: ${i.price} | In-stock: ${i.stock_quantity}`);
      }
      bamazonManager.start();
    });
  },
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

bamazonManager.start();
