const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');   
const database = new sqlite3.Database('./database/db.sqlite');

const runSQLScript = (filename) => {
  const script = fs.readFileSync(filename, 'utf8');
  database.exec(script, (err) => {
    if (err) {
      console.error(err);
    } else {
    console.log("SQL script executed successfully");
  }
});
}

database.serialize(() => {
  runSQLScript('./client/scripts/user.sql');
} );

module.exports = database;