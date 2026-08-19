import pg from "pg";

const tables = new Set(["users", "trips", "payments", "reservations", "companions", "reviews", "favorites", "planned_payments"]);

export function createPostgresPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) return null;
  return new pg.Pool({ connectionString });
}

export function createPostgresStore(pool, table) {
  if (!pool || !tables.has(table)) throw new Error("PostgreSQL store inválido.");
  return {
    async read() {
      const { rows } = await pool.query(`SELECT data FROM ${table} ORDER BY data->>'createdAt' DESC NULLS LAST`);
      return rows.map(({ data }) => data);
    },
    async write(items) {
      // ponytail: snapshot writes reuse the existing services; move to row mutations before running multiple API instances.
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const item of items) {
          const columns = row(table, item);
          await client.query(`INSERT INTO ${table} (${columns.names.join(", ")}) VALUES (${columns.values.map((_, index) => `$${index + 1}`).join(", ")}) ON CONFLICT (id) DO UPDATE SET ${columns.names.slice(1).map((name) => `${name} = EXCLUDED.${name}`).join(", ")}`, columns.values);
        }
        const ids = items.map((item) => item.id);
        await client.query(ids.length ? `DELETE FROM ${table} WHERE NOT (id = ANY($1::text[]))` : `DELETE FROM ${table}`, ids.length ? [ids] : []);
        if (table === "trips") await syncCompanions(client, items);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }
  };
}

async function syncCompanions(client, trips) {
  const companions = trips.flatMap((trip) => (trip.companions || []).map((item) => ({ ...item, tripId: trip.id })));
  for (const companion of companions) {
    await client.query("INSERT INTO companions (id, trip_id, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET trip_id = EXCLUDED.trip_id, data = EXCLUDED.data", [companion.id, companion.tripId, JSON.stringify(companion)]);
  }
  const ids = companions.map((item) => item.id);
  await client.query(ids.length ? "DELETE FROM companions WHERE NOT (id = ANY($1::text[]))" : "DELETE FROM companions", ids.length ? [ids] : []);
}

function row(table, item) {
  const data = JSON.stringify(item);
  if (table === "users") return { names: ["id", "email", "data"], values: [item.id, item.email, data] };
  if (table === "companions") return { names: ["id", "trip_id", "data"], values: [item.id, item.tripId, data] };
  if (table === "reservations") return { names: ["id", "user_email", "trip_id", "data"], values: [item.id, item.userEmail, item.tripId || null, data] };
  return { names: ["id", "user_email", "data"], values: [item.id, item.userEmail, data] };
}
