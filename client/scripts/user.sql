CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE, 
    password VARCHAR(255) NOT NULL,        
    email VARCHAR(255) NOT NULL UNIQUE,    
    email_iv TEXT,                         
    phonenumber VARCHAR(255) NOT NULL UNIQUE,
    phonenumber_plaintext VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points INTEGER NOT NULL DEFAULT 0,
    last_spin_date DATE
);



