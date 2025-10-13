// ================================
// db/rounds.js
// SQLite helpers for rounds
// Requires: expo-sqlite with async API (openDatabaseSync/execAsync/etc.)
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
      course TEXT
    );

    CREATE TABLE IF NOT EXISTS round_holes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id INTEGER NOT NULL,
      hole_number INTEGER NOT NULL,
      strokes INTEGER NOT NULL,
      putts INTEGER NOT NULL DEFAULT 0,
      fairway_hit INTEGER NOT NULL DEFAULT 0,
      green_in_reg INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(round_id) REFERENCES rounds(id) ON DELETE CASCADE
    );
  `);

  // Migrations (fail silently if column already exists)
  try { await db.execAsync(`ALTER TABLE rounds ADD COLUMN course TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE round_holes ADD COLUMN putts INTEGER NOT NULL DEFAULT 0;`); } catch {}
  try { await db.execAsync(`ALTER TABLE round_holes ADD COLUMN fairway_hit INTEGER NOT NULL DEFAULT 0;`); } catch {}
  try { await db.execAsync(`ALTER TABLE round_holes ADD COLUMN green_in_reg INTEGER NOT NULL DEFAULT 0;`); } catch {}
}

export async function saveRound({ date, holesCount, holes, course }) {
  if (!holes?.length) throw new Error("No holes to save");
  const total = holes.reduce((s, h) => s + (h.strokes ?? 0), 0);

  await db.execAsync("BEGIN");
  try {
    const res = await db.runAsync(
      `INSERT INTO rounds (date, holes_count, total_strokes, course)
       VALUES (?, ?, ?, ?)`,
      [date, holesCount, total, course ?? null]
    );
    const roundId = res.lastInsertRowId;

    for (const h of holes) {
      const putts = h.putts ?? 0;
      const fairway = h.fairwayHit ? 1 : 0;
      const gir = h.greenInReg ? 1 : 0;

      await db.runAsync(
        `INSERT INTO round_holes (round_id, hole_number, strokes, putts, fairway_hit, green_in_reg)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [roundId, h.number, h.strokes ?? 0, putts, fairway, gir]
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
  return await db.getAllAsync(
    "SELECT id, date, holes_count, total_strokes, course FROM rounds ORDER BY date DESC"
  );
}

export async function getRoundDetails(roundId) {
  const header = await db.getFirstAsync(
    "SELECT id, date, holes_count, total_strokes, course FROM rounds WHERE id = ?",
    [roundId]
  );
  const holes = await db.getAllAsync(
    `SELECT hole_number as number, strokes, putts, fairway_hit, green_in_reg
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
  }));

  return { ...header, holes: mapped };
}
// db/rounds.js (lägg till längst ned i filen)
export async function deleteRound(roundId) {
  // Foreign keys är ON i initDb(), så round_holes raderas via CASCADE
  await db.runAsync("DELETE FROM rounds WHERE id = ?", [roundId]);
}

