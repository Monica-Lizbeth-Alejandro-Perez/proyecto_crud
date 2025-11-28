// server.js
const express = require('express'); //Framework web
const { Pool } = require('pg');     //Cliente PostgreSQL
const cors = require('cors');       //Permite solicitudes entre dominios

//Creación de la aplicación Express y configuración del puerto

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());  // Habilitar CORS
app.use(express.json()); //Permite recibir JSON en POST/PUT

// Conexión a PostgreSQL (usar DB_HOST desde docker-compose)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false
}
});

// Creación de la tabla USERS 
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    correo TEXT
  )
`).then(() => console.log('Tabla users lista')).catch(err => console.error(err));

// Obtiene todos los usuarios (GET)
// Rutas CRUD
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);  //Enviamos los registros como JSON
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtiene un usuario por ID (GET)
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;  //ID desde la URL
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    res.json(result.rows[0]);  //Regresa un solo usuario
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Crea un usuario (POST)
app.post('/api/users', async (req, res) => {
  try {
    const { nombre, correo } = req.body;  //Datos enviados por el cliente
    const result = await pool.query(
      'INSERT INTO users (nombre, correo) VALUES ($1, $2) RETURNING *',
      [nombre, correo]  //Valores enviados a la consulta
    );
    res.status(201).json(result.rows[0]);  //Regresa el usuario creado
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Actualiza un usuario por ID (PUT)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;  //ID del usuario
    const { nombre, correo } = req.body; //Nuevos datos
    const result = await pool.query(
      'UPDATE users SET nombre=$1, correo=$2 WHERE id=$3 RETURNING *',
      [nombre, correo, id]
    );
    res.json(result.rows[0]);  //Regresa el usuario actualizado
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Elimina un usuario (DELETE)

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params; //ID del usuario a eliminar
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
