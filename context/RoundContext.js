/**

RoundContext
Provides the in-memory state for an active round (holes, current index, metadata) and exposes actions to mutate it (scoring, stats toggles, hole navigation).
Includes snapshot/hydration logic plus a debounced autosave to SQLite via dbSaveActiveRound, so an in-progress round can be resumed from Home/Start.
Guards against duplicate drafts by blocking further autosaves during endRound() and clearing any cached snapshot before persisting the final round.
Automatically saves on app background/unmount, and resumes autosaving when a draft is hydrated.
startRound() initializes holes (optionally with stats fields), while endRound() writes a final, aggregated record to the rounds tables and clears the active draft.
Wrap your app with <RoundProvider> and use useRound() to access current state and the action methods.
*/

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { dbClearActiveRound, dbSaveActiveRound, initDb, saveRound } from "../db/rounds";

const RoundContext = createContext(null);

// --- utils ---

// Simple UUID (sufficient for local IDs)
const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

// Build a persistable snapshot from state
function stateToSnapshot(state) {
  if (!state) return null;
  return {
    version: 1,
    roundId: state.roundId,
    date: state.date,
    holesCount: state.holesCount,
    holeIndex: state.currentIndex ?? 0, // alias for consumers
    currentIndex: state.currentIndex ?? 0,
    holes: state.holes, // strokes + (optional) stats + penalties
    course: state.course ?? null,
    mode: state.mode ?? null, // "stats" | "simple"
    startedAt: state.startedAt ?? Date.now(),
    weather: state.weather ?? null,
    updatedAt: Date.now(),
  };
}

// Convert snapshot back to live state
function snapshotToState(snap) {
  if (!snap) return null;
  return {
    roundId: snap.roundId ?? uuid(),
    date: snap.date ?? new Date().toISOString().slice(0, 10),
    holesCount: snap.holesCount ?? (Array.isArray(snap.holes) ? snap.holes.length : 9),
    holes: Array.isArray(snap.holes) ? snap.holes : [],
    currentIndex: snap.currentIndex ?? snap.holeIndex ?? 0,
    course: snap.course ?? null,
    mode: snap.mode ?? null,
    startedAt: snap.startedAt ?? Date.now(),
    weather: snap.weather ?? null,
  };
}

export function RoundProvider({ children }) {
  // current: {
  //   roundId, date, holesCount, holes:[{number, strokes, putts?, fairwayHit?, greenInReg?, penalties?}],
  //   currentIndex, course?, mode?, startedAt?, weather?
  // }
  const [current, setCurrent] = useState(null);

  // Debounced save machinery
  const saveTimerRef = useRef(null);
  const latestSnapRef = useRef(null);
  // Block further autosaves when finishing a round (prevents re-creating drafts)
  const blockSavesRef = useRef(false);

  useEffect(() => {
    initDb().catch(console.warn);
  }, []);

  // Debounced schedule (no-ops if finishing or no state)
  const scheduleSave = (nextState) => {
    if (blockSavesRef.current) return;
    if (!nextState) return;
    const snap = stateToSnapshot(nextState);
    if (!snap) return;

    latestSnapRef.current = snap;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (blockSavesRef.current) return;
      if (!latestSnapRef.current) return;
      dbSaveActiveRound(latestSnapRef.current).catch((e) =>
        console.warn("dbSaveActiveRound (debounced) failed:", e)
      );
    }, 250);
  };

  // Immediate save (background/unmount/endRound). No-ops if finishing.
  const saveNow = async () => {
    if (blockSavesRef.current) return;
    const snap = latestSnapRef.current || stateToSnapshot(current);
    if (!snap) return;
    try {
      await dbSaveActiveRound(snap);
    } catch (e) {
      console.warn("dbSaveActiveRound (immediate) failed:", e);
    }
  };

  // Unified updater that also schedules a save
  const applyUpdate = (mutator) => {
    if (blockSavesRef.current) {
      // If we’re finishing, mutate without scheduling saves
      setCurrent(mutator);
      return;
    }
    setCurrent((prev) => {
      const next = mutator(prev);
      scheduleSave(next);
      return next;
    });
  };

  // Save when app backgrounds; best-effort on unmount
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background") saveNow();
    });
    return () => {
      sub.remove();
      saveNow();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const value = useMemo(
    () => ({
      /**
       * Start a new round.
       * @param {number} holesCount - 9 or 18 (default 9)
       * @param {object} extras - optional metadata (e.g. { course, mode: "stats"|"simple", startedAt, weather })
       */
      startRound: (holesCount = 9, extras = {}) => {
        // New session → allow autosaves and reset snapshot cache
        blockSavesRef.current = false;
        latestSnapRef.current = null;
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }

        const today = new Date().toISOString().slice(0, 10);
        const withStats = extras?.mode === "stats";
        const id = uuid();

        const holes = Array.from({ length: holesCount }, (_, i) => ({
          number: i + 1,
          strokes: 0,
          ...(withStats
            ? { putts: 0, fairwayHit: false, greenInReg: false, penalties: 0 }
            : {}),
        }));

        const next = {
          roundId: id,
          date: today,
          holesCount,
          holes,
          currentIndex: 0,
          ...extras, // course, mode, startedAt, weather
        };

        setCurrent(next);
        scheduleSave(next); // persist the new draft right away
      },

      // --- scoring ---
      setStrokeForHole: (holeNumber, strokes) => {
        applyUpdate((c) => {
          if (!c) return c;
          const holes = c.holes.map((h) =>
            h.number === holeNumber ? { ...h, strokes: Math.max(0, strokes) } : h
          );
          return { ...c, holes };
        });
      },

      // --- stats helpers ---
      setPuttsForHole: (holeNumber, putts) =>
        applyUpdate((c) => {
          if (!c) return c;
          const holes = c.holes.map((h) =>
            h.number === holeNumber ? { ...h, putts: Math.max(0, putts) } : h
          );
          return { ...c, holes };
        }),

      setPenaltiesForHole: (holeNumber, penalties) =>
        applyUpdate((c) => {
          if (!c) return c;
          const holes = c.holes.map((h) =>
            h.number === holeNumber ? { ...h, penalties: Math.max(0, penalties) } : h
          );
          return { ...c, holes };
        }),

      toggleFairwayHit: (holeNumber) =>
        applyUpdate((c) => {
          if (!c) return c;
          const holes = c.holes.map((h) =>
            h.number === holeNumber ? { ...h, fairwayHit: !h.fairwayHit } : h
          );
          return { ...c, holes };
        }),

      toggleGreenInReg: (holeNumber) =>
        applyUpdate((c) => {
          if (!c) return c;
          const holes = c.holes.map((h) =>
            h.number === holeNumber ? { ...h, greenInReg: !h.greenInReg } : h
          );
          return { ...c, holes };
        }),

      // --- navigation between holes ---
      nextHole: () =>
        applyUpdate((c) =>
          !c ? c : { ...c, currentIndex: Math.min(c.holesCount - 1, c.currentIndex + 1) }
        ),

      prevHole: () =>
        applyUpdate((c) =>
          !c ? c : { ...c, currentIndex: Math.max(0, c.currentIndex - 1) }
        ),

      // --- hydrate from saved snapshot (call this from Home/Start when user taps Resume) ---
      hydrateFromSnapshot: (snap) => {
        blockSavesRef.current = false; // resuming a draft—allow autosaves again
        const next = snapshotToState(snap); // keeps original roundId
        setCurrent(next);
        scheduleSave(next); // update updatedAt and keep pointer fresh
      },

      // --- finalize/save ---
      endRound: async () => {
        if (!current) return null;

        // Block any further autosaves and drop cached snapshot BEFORE touching storage.
        blockSavesRef.current = true;
        latestSnapRef.current = null;
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }

        const payload = {
          date: current.date,
          holesCount: current.holesCount,
          holes: current.holes, // strokes + stats + penalties
          course: current.course ?? null,
          weather: current.weather ?? null, // saved in rounds table if present
        };

        const saved = await saveRound(payload);

        // Clear the draft storage. Even if this fails, we keep state null.
        try {
          await dbClearActiveRound();
        } catch (e) {
          console.warn("dbClearActiveRound failed:", e);
        }

        // Finally clear in-memory state so Home shows no draft.
        setCurrent(null);
        return saved;
      },

      // Optional: expose a snapshot getter for debugging
      stateToSnapshot: () => stateToSnapshot(current),

      current,
    }),
    [current]
  );

  return <RoundContext.Provider value={value}>{children}</RoundContext.Provider>;
}

export function useRound() {
  const ctx = useContext(RoundContext);
  if (!ctx) throw new Error("useRound must be used within RoundProvider");
  return ctx;
}
