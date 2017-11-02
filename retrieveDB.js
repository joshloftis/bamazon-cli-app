const mysql = require('mysql');

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazonDB"
});

const retrieveAllDb = function(table, col1, col2, col3, col4, col5, cb) {
  connection.query('SELECT * FROM }', `${table}`, function(err, res) {
    if (err) throw err;
    for (let i of res) {
      console.log(`ID: ${i.col1} | Product: ${i.col2} | Department: ${i.col3} | Price: ${i.col4} | In-stock: ${i.col5}`);
    }
    return cb;
  });
};

module.exports = {
  retrieveAllDb,
  connection
};
