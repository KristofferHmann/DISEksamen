const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const database = new sqlite3.Database(path.resolve(__dirname, './database/db.sqlite'), (err) => {
  if (err) {
    console.error('Fejl ved forbindelse til databasen:', err.message);
  } else {
    console.log('Forbundet til SQLite-databasen.');
  }
});


// Run SQL script
/*const runSQLScript = (filename) => {
  const script = fs.readFileSync(filename, 'utf8');
  database.exec(script, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("SQL script executed successfully");
    }
  });
}*/
/*
database.serialize(() => {
  runSQLScript('./client/scripts/user.sql');
});*/

// Kontrollér og opret tabel, hvis den ikke findes
const ensureTableExists = () => {
  const query = `SELECT name FROM sqlite_master WHERE type='table' AND name='users';`;

  database.get(query, (err, row) => {
    if (err) {
      console.error('Fejl ved kontrol af tabel:', err.message);
      return;
    }

    if (!row) {
      console.log('Tabel "users" findes ikke. Opretter tabel...');
      const script = fs.readFileSync('./client/scripts/user.sql', 'utf8');
      database.exec(script, (err) => {
        if (err) {
          console.error('Fejl ved oprettelse af tabel:', err.message);
        } else {
          console.log('Tabel "users" oprettet succesfuldt.');
        }
      });
    } else {
      console.log('Tabel "users" findes allerede. Ingen handling nødvendig.');
    }
  });
};

ensureTableExists();

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

  // Get user by username and password
  async getUserByUsernameAndPassword(username, password) {
    return new Promise((resolve, reject) => {
      const query = `SELECT id, username FROM users WHERE username = @username AND password = @password`;
      const params = {
        '@username': username,
        '@password': password,
      };
      database.get(query, params, (err, row) => {
        if (err) {
          console.error("Error fetching user by username and password", err.message);
          reject(err);
        } else {
          resolve(row); // Resolve with the user row if found, or null if not
        }
      });
    });
  }

}

module.exports = new Database();