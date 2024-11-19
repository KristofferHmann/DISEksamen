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

async function signupUser(data) {
    try {
     await this.connect();
        const request = this.poolconnection.request();

    request.input('username', sql.VarChar, data.username)
    request.input('password', sql.VarChar, data.password)
    request.input('email', sql.VarChar, data.email)         
    request.input('phone', sql.VarChar, data.phone)
    request.input('timeCreated', sql.VarChar, data.timeCreated)

  const result = await request.query(
    'INSERT INTO users (username, password, email, phone, timeCreated) VALUES (@username, @password, @email, @phone, @timeCreated)');
    return result.rowsAffected[0];
  } catch (error) {
    console.error("Fejl ved registering af bruger", error.message); 
    throw error;
 }};