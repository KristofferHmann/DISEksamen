const sqlite3 = require('sqlite3').verbose();

// Opret forbindelse til SQLite-databasen
const db = new sqlite3.Database('./db.qdlite');

// Funktion til at køre en SQL-forespørgsel
function runQuery(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ changes: this.changes });
            }
        });
    });
}

// Funktion til at opdatere billed-URL'en i menu-tabellen
async function updateMenuImage(id, imageUrl) {
    try {
        const result = await runQuery(
            'UPDATE menu SET image_url = ? WHERE id = ?',
            [imageUrl, id]
        );
        console.log(`Number of rows updated: ${result.changes}`);
    } catch (error) {
        console.error('Error updating menu image:', error.message);
    } finally {
        db.close();
    }
}

// Kald funktionen for at opdatere billed-URL'en
updateMenuImage(1, 'https://res.cloudinary.com/dfaz3ygzy/image/upload/v1733838089/foto-joe-and-the-juice-gate-c-paskontrollen_wdip6o.jpg');