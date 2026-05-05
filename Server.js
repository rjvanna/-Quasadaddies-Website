require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({ host: 'localhost', user: 'root', password: process.env.DB_PASSWORD, database: 'quesadaddies' });

db.connect(err => {
    if (err) throw err;
    console.log('connected to mysql!');
    db.query(`CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), phone VARCHAR(50), items TEXT, total VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
});

app.post('/order', (req, res) => {
    const o = req.body;
    db.query('INSERT INTO orders (name, phone, items, total) VALUES (?, ?, ?, ?)',
        [o.name, o.phone, JSON.stringify(o.items || o), o.total],
        err => err ? res.status(500).json({ success: false }) : res.json({ success: true, message: 'Order saved!' })
    );
});

app.get('/orders', (req, res) => {
    db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(3000, () => console.log('running on http://localhost:3000'));