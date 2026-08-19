import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createPostgresPool, createPostgresStore } from "../src/storage/postgres-store.js";

const pool = createPostgresPool();
if (!pool) throw new Error("DATABASE_URL es obligatoria.");
const command = process.argv[2];
const file = resolve(process.argv[3] || "backups/atlasiq.json");
const order = ["users", "trips", "payments", "reservations", "companions", "reviews", "favorites", "planned_payments"];

try {
  if (command === "migrate") {
    await pool.query(await readFile(resolve("backend/migrations/001_initial.sql"), "utf8"));
  } else if (command === "import-json") {
    await pool.query(await readFile(resolve("backend/migrations/001_initial.sql"), "utf8"));
    const users = await json("backend/data/users.json");
    const trips = await json("backend/data/trips.json");
    const payments = await json("backend/data/payments.json");
    await createPostgresStore(pool, "users").write(users);
    await createPostgresStore(pool, "trips").write(trips);
    await createPostgresStore(pool, "payments").write(payments);
    await createPostgresStore(pool, "companions").write(trips.flatMap((trip) => (trip.companions || []).map((item) => ({ ...item, tripId: trip.id }))));
  } else if (command === "backup") {
    const data = {};
    for (const table of order) data[table] = await createPostgresStore(pool, table).read();
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify({ createdAt: new Date().toISOString(), data }, null, 2));
  } else if (command === "restore") {
    const backup = JSON.parse(await readFile(file, "utf8"));
    await pool.query(await readFile(resolve("backend/migrations/001_initial.sql"), "utf8"));
    for (const table of order) await createPostgresStore(pool, table).write(backup.data?.[table] || []);
  } else {
    throw new Error("Usa: migrate, import-json, backup o restore [archivo].");
  }
  console.log(`Base de datos: ${command} completado.`);
} finally {
  await pool.end();
}

async function json(path) {
  try { return JSON.parse(await readFile(resolve(path), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}
