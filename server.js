const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuración de SQLite
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run('CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT)');
});

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API para obtener mensajes
app.get('/api/messages', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).send('Error al obtener mensajes.');
    res.json(rows);
  });
});

// API para agregar un mensaje
app.post('/api/messages', (req, res) => {
  const { message } = req.body;
  if (!message || message.length > 200) {
    return res.status(400).send('El mensaje no puede estar vacío ni superar los 200 caracteres.');
  }

  db.run('INSERT INTO messages (message) VALUES (?)', [message], function (err) {
    if (err) return res.status(500).send('Error al guardar el mensaje.');
    res.status(201).send({ id: this.lastID });
  });
});

// Servir frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
