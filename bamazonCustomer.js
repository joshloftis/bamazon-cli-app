//Setting up dependencies
//==============================================================================================================
const mysql = require("mysql");
const inquirer = require("inquirer");
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
const bamazon = {
  //retrieves all data from the products table
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
      return cb;
    });
  },
  //Inquirer to determine if the user wants to buy something and if so what and how many
  inquire: function() {
    inquirer.prompt([
    {
      name: 'confirm',
      type: 'confirm',
      message: 'Would you like to buy something?'
    }
    ]).then(function(ans){
      if (ans.confirm) {
        inquirer.prompt([
          {
            name: 'item',
            type: 'input',
            message: "Please enter the ID of the item you'd like to buy:"
          },
          {
            name: 'quantity',
            type: 'input',
            message: "Please enter the number that item you'd like to buy:"
          }
        ]).then(function(ans){
          connection.query('SELECT stock_quantity,price,product_name FROM products WHERE ?', [{item_id: ans.item}], function(err, res) {
            if (parseFloat(ans.quantity) <= res[0].stock_quantity) {
              bamazon.buyItem(ans.item, ans.quantity, res[0].stock_quantity, res[0].price, res[0].product_name);
            } else {
              console.log('Insufficient quantity!');
              bamazon.retrieveAllDb('Insufficient quantity!', setTimeout(function(){bamazon.inquire();},100));
            }
          });
        });
      } else {
        connection.end();
      }
    });
  },
  // If the user selects to buy an item and chooses an appropriate quantity then this function handles that purchase
  buyItem: function(item, ansQuantity, dbQuantity, price, name) {
    let newQuantity = dbQuantity - ansQuantity;
    let custCost = ansQuantity * price;
    connection.query('UPDATE products SET ? WHERE ?', [{stock_quantity: newQuantity, product_sales: custCost}, {item_id: item}], function(err, res){
      if (err) throw err;
      console.log('');
      console.log(`=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$`);
      console.log(`Congratulations! You've bought ${ansQuantity} of ${name} for $${custCost}`);
      console.log(`=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$=$`);
      console.log('');
      bamazon.retrieveAllDb(setTimeout(function(){
        bamazon.inquire();
      },100));
    });
  }
};

//Creating a connection and then invoking the function to start the app
//==============================================================================================================
connection.connect(function(err) {
  if (err) throw err;
  //Settimeout callback to delay inquirer long enough for the database to return the table data
  bamazon.retrieveAllDb(setTimeout(function(){
    bamazon.inquire();
  },100));
});
