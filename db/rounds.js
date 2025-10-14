// ================================
// db/rounds.js
// SQLite helpers for rounds
// Requires expo-sqlite (async API)
// ================================
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("fairplay.db");

export async function initDb() {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      holes_count INTEGER NOT NULL,
      total_strokes INTEGER NOT NULL,
      course TEXT,
      -- weather (optional)
      weather_temp_c REAL,
      weather_wind_mps REAL,
      weather_code INTEGER,
      weather_desc TEXT,
      weather_time TEXT,
      weather_lat REAL,
      weather_lon REAL
    );

    CREATE TABLE IF NOT EXISTS round_holes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id INTEGER NOT NULL,
      hole_number INTEGER NOT NULL,
      strokes INTEGER NOT NULL,
      putts INTEGER NOT NULL DEFAULT 0,
      fairway_hit INTEGER NOT NULL DEFAULT 0,
      green_in_reg INTEGER NOT NULL DEFAULT 0,
      penalties INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(round_id) REFERENCES rounds(id) ON DELETE CASCADE
    );
  `);

  // Migrations (fail-silent if columns already exist)
  try { await db.execAsync(`ALTER TABLE rounds ADD COLUMN course TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE round_holes ADD COLUMN putts INTEGER NOT NULL DEFAULT 0;`); } catch {}
  try { await db.execAsync(`ALTER TABLE round_holes ADD COLUMN fairway_hit INTEGER NOT NULL DEFAULT 0;`); } catch {}
  try { await db.execAsync(`ALTER TABLE round_holes ADD COLUMN green_in_reg INTEGER NOT NULL DEFAULT 0;`); } catch {}
  try { await db.execAsync(`ALTER TABLE round_holes ADD COLUMN penalties INTEGER NOT NULL DEFAULT 0;`); } catch {}

  // Weather fields
  try { await db.execAsync(`ALTER TABLE rounds ADD COLUMN weather_temp_c REAL;`); } catch {}
  try { await db.execAsync(`ALTER TABLE rounds ADD COLUMN weather_wind_mps REAL;`); } catch {}
  try { await db.execAsync(`ALTER TABLE rounds ADD COLUMN weather_code INTEGER;`); } catch {}
  try { await db.execAsync(`ALTER TABLE rounds ADD COLUMN weather_desc TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE rounds ADD COLUMN weather_time TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE rounds ADD COLUMN weather_lat REAL;`); } catch {}
  try { await db.execAsync(`ALTER TABLE rounds ADD COLUMN weather_lon REAL;`); } catch {}
}

export async function saveRound({ date, holesCount, holes, course, weather }) {
  if (!holes?.length) throw new Error("No holes to save");
  const total = holes.reduce((s, h) => s + (h.strokes ?? 0), 0);

  await db.execAsync("BEGIN");
  try {
    const res = await db.runAsync(
      `INSERT INTO rounds (
        date, holes_count, total_strokes, course,
        weather_temp_c, weather_wind_mps, weather_code, weather_desc, weather_time, weather_lat, weather_lon
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        holesCount,
        total,
        course ?? null,
        weather?.tempC ?? null,
        weather?.windMps ?? null,
        weather?.code ?? null,
        weather?.desc ?? null,
        weather?.time ?? null,
        weather?.lat ?? null,
        weather?.lon ?? null,
      ]
    );
    const roundId = res.lastInsertRowId;

    for (const h of holes) {
      const putts = h.putts ?? 0;
      const fairway = h.fairwayHit ? 1 : 0;
      const gir = h.greenInReg ? 1 : 0;
      const penalties = h.penalties ?? 0;

      await db.runAsync(
        `INSERT INTO round_holes
         (round_id, hole_number, strokes, putts, fairway_hit, green_in_reg, penalties)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [roundId, h.number, h.strokes ?? 0, putts, fairway, gir, penalties]
      );
    }

    await db.execAsync("COMMIT");
    return { id: roundId, total };
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}

export async function getRounds() {
  // Används för listor + Home (senaste 3). Sortering senast först.
  return await db.getAllAsync(
    `SELECT id, date, holes_count, total_strokes, course
     FROM rounds
     ORDER BY date DESC, id DESC`
  );
}

export async function getRoundDetails(roundId) {
  const header = await db.getFirstAsync(
    `SELECT
        id, date, holes_count, total_strokes, course,
        weather_temp_c, weather_wind_mps, weather_code, weather_desc, weather_time, weather_lat, weather_lon
     FROM rounds
     WHERE id = ?`,
    [roundId]
  );

  const holes = await db.getAllAsync(
    `SELECT
        hole_number as number,
        strokes, putts, fairway_hit, green_in_reg, penalties
     FROM round_holes
     WHERE round_id = ?
     ORDER BY hole_number`,
    [roundId]
  );

  const mapped = holes.map((h) => ({
    number: h.number,
    strokes: h.strokes,
    putts: h.putts ?? 0,
    fairwayHit: !!h.fairway_hit,
    greenInReg: !!h.green_in_reg,
    penalties: h.penalties ?? 0,
  }));

  return {
    ...header,
    holes: mapped,
    weather: {
      tempC: header?.weather_temp_c ?? null,
      windMps: header?.weather_wind_mps ?? null,
      code: header?.weather_code ?? null,
      desc: header?.weather_desc ?? null,
      time: header?.weather_time ?? null,
      lat: header?.weather_lat ?? null,
      lon: header?.weather_lon ?? null,
    },
  };
}

export async function deleteRound(roundId) {
  // Foreign keys ON => round_holes rensas via CASCADE
  await db.runAsync("DELETE FROM rounds WHERE id = ?", [roundId]);
}
