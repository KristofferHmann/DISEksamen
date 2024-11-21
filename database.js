const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const database = new sqlite3.Database('./database/db.sqlite');


// Run SQL script
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
});



class Database {
  //Lav en bruger
  async signupUser(data) {
    return new Promise((resolve, reject) => {
      const { username, password, email, phonenumber, created_at } = data;
      const query = `INSERT INTO users (username, password, email, phonenumber, created_at) VALUES (@username, @password, @email, @phonenumber, @created_at)`;
      const params = {
        '@username': username,
        '@password': password,
        '@email': email,
        '@phonenumber': phonenumber,
        '@created_at': created_at
      };
      database.run(query, params, function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            console.error("Fejl ved registrering af bruger: Unik constraint overtrådt", err.message);
            reject(new Error('Username, email, or phone number already exists.'));
          } else {
            console.error("Fejl ved registrering af bruger", err.message);
            reject(err);
          }
        } else {
          resolve(this.lastID); // Return the ID of the newly created user
        }
      });
    });
  }



}

module.exports = new Database();