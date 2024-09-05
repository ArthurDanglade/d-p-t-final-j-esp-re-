const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Hitomi2000-',
  database: 'Bubble2'
});

module.exports = connection;
