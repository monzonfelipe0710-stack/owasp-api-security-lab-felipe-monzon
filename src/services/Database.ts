import sqlite3 from "sqlite3";
import crypto from "crypto";
import path from "path";
import fs from "fs";

const DBSOURCE = process.env.DB_PATH || path.resolve(process.cwd(), "db.sqlite");

// Asegurar que el directorio de la base de datos exista
const dbDir = path.dirname(DBSOURCE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(`Error al conectar con SQLite (${DBSOURCE}):`, err.message);
    throw err;
  }

  console.log("Conectado a la base de datos SQLite.");

  const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            profile_picture_url TEXT
        )
    `;

  db.run(sql, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Tabla "users" creada o ya existente.');

    const adminUser = "admin";
    const adminPass = "admin123";
    const adminEmail = "admin@example.com";

    const insertAdmin =
      "INSERT OR IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)";
    db.run(insertAdmin, [adminUser, adminPass, adminEmail, "admin"], (err) => {
      if (err) {
        return console.error("Error al insertar usuario admin:", err.message);
      }
      console.log(
        "Usuario administrador por defecto asegurado (o ya existente).",
      );
    });
  });
});

const hash = (password: string) => {
  return crypto.createHash("md5").update(password).digest("hex");
};

export { db, hash };
