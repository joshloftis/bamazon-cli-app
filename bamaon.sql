DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
  item_id INTEGER NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(250) NOT NULL,
  department_name VARCHAR(250) NOT NULL,
  price INTEGER(10) NOT NULL,
  stock_quantity INTEGER(10) NOT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES
  ('Macbook Pro', 'Electronics', 1700, 50),
  ('Herschel Backpack', 'Accessories', 50, 100),
  ('Apricot La Croix', 'Home Goods', 5, 40),
  ('Fender Guitar', 'Music', 500, 12),
  ('Star Wars Box Set', 'Movies', 60, 400),
  ('Coffee Table', 'Furniture', 75, 75),
  ('Who Went Poo?', 'Books', 12, 300),
  ('Black Cat', 'Live Pets', 500, 3),
  ('Sock Monkey', 'Toys', 125, 8),
  ('Heart Locket', 'Jewelry', 2103, 2);


CREATE TABLE departments (
  department_id INTEGER NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(250) NOT NULL,
  over_head_costs INTEGER(10) NOT NULL,
  PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs) VALUES
  ('Electronics', 10000),
  ('Accessories', 500),
  ('Home Goods', 1000),
  ('Music', 4000),
  ('Movies', 2000),
  ('Furniture', 6000),
  ('Books', 400),
  ('Live Pets', 3000),
  ('Toys', 900),
  ('Jewelry', 12000);

ALTER TABLE products ADD product_sales INTEGER(10) NULL;
