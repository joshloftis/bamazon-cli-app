const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazonDB"
});

const bamazon = {
  retrieveAllDb: function(cb) { //function that selects all from the db
    connection.query('SELECT * FROM products', function(err, res){
      if (err) throw err;
      for (let i of res) {
        console.log(`ID: ${i.item_id} | Product: ${i.product_name} | Department: ${i.department_name} | Price: ${i.price} | In-stock: ${i.stock_quantity}`);
      }
      console.log(`=======================================================================`);
      console.log(`=======================================================================`);
      return cb;
    });
  },
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
            return (parseFloat(ans.quantity) < res[0].stock_quantity) ? bamazon.buyItem(ans.item, ans.quantity, res[0].stock_quantity, res[0].price, res[0].product_name) : connection.end(console.log('Insufficient Quantity!'));
          });
        });
      } else {
        connection.end();
      }
    });
  },
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

connection.connect(function(err) {
  if (err) throw err;
  bamazon.retrieveAllDb(setTimeout(function(){
    bamazon.inquire();
  },100));
});
