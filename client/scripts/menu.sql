CREATE TABLE menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category VARCHAR(255) NOT NULL, 
    name VARCHAR(255) NOT NULL,
    ingredient VARCHAR(255) NOT NULL,
    cost INTEGER NOT NULL
);  

CREATE TABLE points_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    change INTEGER NOT NULL, 
    description VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE menu_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (menu_id) REFERENCES menu (id)
);
DELETE FROM points_transactions;
INSERT INTO menu (category, name, ingredient, cost) VALUES
('Combo', 'Combo Name', 'Sandwich, Juice, Coffee', 125),
('Drinks', 'Fresh Juice', 'Orange, Apple, Carrot', 45),
('Drinks', 'Coffee', 'Espresso, Latte, Cappuccino', 30),
('Drinks', 'Protein Shake', 'Chocolate, Vanilla, Strawberry', 50),
('Food', 'JOEs Club', 'Joes Classic Bread, Avocado, Chicken, Tomato, Vegan Pesto', 75),
('Food', 'Tunacado', 'Joes Classic Bread, Avocado, Tomato, Tuna Mousse, Vegan Pesto', 75);


ALTER TABLE menu ADD COLUMN image_url VARCHAR(255);


UPDATE menu SET image_url = 'https://res.cloudinary.com/dfaz3ygzy/image/upload/v1732695810/JoeProject/6655c0b1a45b36bc9cb18a24_Tunacado-1.png' WHERE id = 6;

UPDATE menu SET image_url = 'https://res.cloudinary.com/dfaz3ygzy/image/upload/v1733686716/JOEs_Club_wrrfh9.jpg' WHERE id = 5;

UPDATE menu SET image_url = 'https://res.cloudinary.com/dfaz3ygzy/image/upload/v1733686726/kaffe_joe_nzhmrm.jpg' WHERE id = 3;

UPDATE menu SET image_url = 'https://res.cloudinary.com/dfaz3ygzy/image/upload/v1733687029/juice_kfg443.jpg' WHERE id = 2;

UPDATE menu SET image_url = 'https://res.cloudinary.com/dfaz3ygzy/image/upload/v1733687033/protein_shake_bnynw0.jpg' WHERE id = 4;

UPDATE menu SET image_url = 'https://res.cloudinary.com/dfaz3ygzy/image/upload/v1733838089/foto-joe-and-the-juice-gate-c-paskontrollen_wdip6o.jpg' WHERE id = 1;

INSERT INTO uploads (url, caption) VALUES ('https://res.cloudinary.com/dfaz3ygzy/image/upload/v1732404438/JoeProject/joeLogo.svg', 'Logo');

INSERT INTO uploads (url, caption) VALUES ('https://res.cloudinary.com/dfaz3ygzy/image/upload/v1729758286/cdn-example/joeProducts.webp', 'Hjemmeskærm');
 DROP TABLE menu;