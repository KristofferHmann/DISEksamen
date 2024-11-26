const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const database = new sqlite3.Database(path.resolve(__dirname, './database/db.sqlite'), (err) => {
  if (err) {
    console.error('Fejl ved forbindelse til databasen:', err.message);
  } else {
    console.log('Forbundet til SQLite-databasen.');
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, // Replace with your Cloudinary API key
  api_secret: process.env.CLOUDINART_API_SECRET, // Replace with your Cloudinary API secret
  secure: true,
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

//Table for uploads
database.serialize(() => {
  database.run(
    "CREATE TABLE IF NOT EXISTS uploads (id INTEGER PRIMARY KEY, url TEXT NOT NULL, datetime INTEGER, caption TEXT)"
  );
});

const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    database.run(query, params, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};
const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    database.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    database.all(query, params, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
};





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
  async getUserByUsername(username) {
    
      if (typeof username !== "string") {
        console.error("Invalid input for username:", username);
        throw new Error("Invalid username input");
      }
    return new Promise((resolve, reject) => {
      const query = `SELECT id, username, password FROM users WHERE username = ?`;
      const params = [username];

      database.get(query, params, (err, row) => {
      if (err) {
        console.error("Error fetching user by username", err.message);
        reject(err);
      } else if (!row) {
        console.log("No user found with username:", username);
        resolve(null); // Resolve with null if no user is found
      } else {
        console.log("Database query result:", row); // Debugging log
        resolve(row); // Resolve with the user row if found
      }
      });
    });
  }
  async getUserById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT id, username, email FROM users WHERE id = ?`;
      const params = [id];
  
      database.get(query, params, (err, row) => {
        if (err) {
          console.error("Error fetching user by ID:", err.message);
          reject(err);
        } else if (!row) {
          console.log("No user found with ID:", id);
          resolve(null);
        } else {
          console.log("Database query result by ID:", row);
          resolve(row);
        }
      });
    });
  }
  async  upload(file) {
    const uploadOptions = {
      folder: "JoeProject",
      public_id:  path.basename(file, path.extname(file)),
      resource_type: "auto",
    };
    try {
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      await runQuery(
        "INSERT INTO uploads (url, datetime, caption) VALUES (?, ?, ?)",
        [result.secure_url, Date.now(), result.original_filename]
      );
      console.log(result);
      getUploads();
    } catch (error) {
      console.error(error);
    }
  }
  
}

const getLocations = async () => {
  try {
    const query = `SELECT * FROM locations`;
    const locations = await allQuery(query); // Fetch data using the allQuery helper
    return locations; // Return the array of location objects
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    throw new Error('Could not fetch locations');
  }
};

const databaseInstance = new Database();
module.exports = { databaseInstance, allQuery, runQuery, getQuery, getLocations};