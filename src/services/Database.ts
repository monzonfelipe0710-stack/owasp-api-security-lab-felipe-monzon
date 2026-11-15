
import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const DBSOURCE =
  process.env.DB_PATH || path.resolve(process.cwd(), "db.sqlite");

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
      console.error('Error al crear la tabla users:', err.message);
      return;
    }

    console.log('Tabla "users" creada o ya existente.');

    // Crear tabla para almacenar los tokens JWT revocados
    db.run(`
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        jti TEXT PRIMARY KEY,
        revoked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error("Error al crear revoked_tokens:", err.message);
        return;
      }

      console.log('Tabla "revoked_tokens" creada o ya existente.');

      initializeAdminAndMigratePasswords();
    });
  });
});

// Inicializar administrador y migrar contraseñas existentes
const initializeAdminAndMigratePasswords = async () => {
  try {
    const adminPasswordHash = await bcrypt.hash("admin123", 12);

    db.run(
      "INSERT OR IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
      ["admin", adminPasswordHash, "admin@example.com", "admin"],
      (err) => {
        if (err) {
          console.error("Error al insertar usuario administrador:", err.message);
          return;
        }

        db.all(
          "SELECT id, password FROM users",
          [],
          async (err, users: { id: number; password: string }[]) => {
            if (err) {
              console.error("Error al consultar usuarios:", err.message);
              return;
            }

            try {
              for (const user of users) {
                // Migrar únicamente contraseñas que todavía no usan bcrypt
                if (!/^\$2[aby]\$/.test(user.password)) {
                  const passwordHash = await bcrypt.hash(user.password, 12);

                  await new Promise<void>((resolve, reject) => {
                    db.run(
                      "UPDATE users SET password = ? WHERE id = ?",
                      [passwordHash, user.id],
                      (updateError) => {
                        if (updateError) {
                          reject(updateError);
                        } else {
                          resolve();
                        }
                      }
                    );
                  });
                }
              }

              console.log("Contraseñas migradas y protegidas con bcrypt.");
              console.log("Inicialización de seguridad completada.");
            } catch (migrationError) {
              console.error("Error al migrar contraseñas:", migrationError);
            }
          }
        );
      }
    );
  } catch (error) {
    console.error("Error al inicializar la seguridad:", error);
  }
};

export { db };
