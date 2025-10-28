// storage/activeRound.js
//
// SQLite-backed snapshot storage for the *currently active round* (offline-first).
// Persists a single JSON “last” record in table `active_rounds` (created idempotently).
// Uses expo-sqlite via a tiny Promise wrapper (execAsync); each call runs inside a transaction.
// No schema migrations here—bump the embedded `version` in the payload if your snapshot shape changes.
// Designed to be fast, resilient, and non-blocking; failures never corrupt partial data.

import * as SQLite from "expo-sqlite";

// Use the existing DB file name if you have one
const db = SQLite.openDatabase("app.db");

// Tiny promise wrapper for executeSql
function execAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, res) => resolve(res),
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
}

// Ensure table exists (idempotent)
async function ensureTable() {
  await execAsync(
    `CREATE TABLE IF NOT EXISTS active_rounds (
       key TEXT PRIMARY KEY NOT NULL,
       value TEXT NOT NULL,
       updated_at INTEGER NOT NULL
     );`
  );
}

/**
 * Save/overwrite the currently active round snapshot.
 */
export async function saveActiveRound(snap) {
  await ensureTable();
  const payload = JSON.stringify({
    ...snap,
    version: 1,
    updatedAt: Date.now(),
  });
  await execAsync(
    `REPLACE INTO active_rounds (key, value, updated_at) VALUES (?, ?, ?);`,
    ["last", payload, Date.now()]
  );
}

/** Load the last active round snapshot, or null if none. */
export async function loadActiveRound() {
  await ensureTable();
  const res = await execAsync(`SELECT value FROM active_rounds WHERE key = ?;`, ["last"]);
  if (!res.rows || res.rows.length === 0) return null;
  const raw = res.rows.item(0).value;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Clear the saved draft. roundId is optional here since we keep a single 'last'. */
export async function clearActiveRound(/* roundId */) {
  await ensureTable();
  await execAsync(`DELETE FROM active_rounds WHERE key = ?;`, ["last"]);
}
