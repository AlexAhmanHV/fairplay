// ================================
// context/RoundContext.js
// Holds an in-memory ongoing round until saved
// ================================
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initDb, saveRound } from "../db/rounds";

const RoundContext = createContext(null);

export function RoundProvider({ children }) {
  // current: {
  //   date, holesCount, holes:[{number, strokes, putts?, fairwayHit?, greenInReg?, penalties?}],
  //   currentIndex, course?, mode?, startedAt?, weather?
  // }
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    initDb().catch(console.warn);
  }, []);

  const value = useMemo(
    () => ({
      /**
       * Start a new round.
       * @param {number} holesCount - 9 or 18 (default 9)
       * @param {object} extras - optional metadata (e.g. { course, mode: "stats"|"simple", startedAt, weather })
       */
      startRound: (holesCount = 9, extras = {}) => {
        const today = new Date().toISOString().slice(0, 10);
        const withStats = extras?.mode === "stats";

        const holes = Array.from({ length: holesCount }, (_, i) => ({
          number: i + 1,
          strokes: 0,
          ...(withStats
            ? { putts: 0, fairwayHit: false, greenInReg: false, penalties: 0 }
            : {}),
        }));

        setCurrent({
          date: today,
          holesCount,
          holes,
          currentIndex: 0,
          ...extras, // course, mode, startedAt, weather
        });
      },

      // --- scoring ---
      setStrokeForHole: (holeNumber, strokes) => {
        setCurrent((c) => {
          if (!c) return c;
          const holes = c.holes.map((h) =>
            h.number === holeNumber ? { ...h, strokes: Math.max(0, strokes) } : h
          );
          return { ...c, holes };
        });
      },

      // --- stats helpers ---
      setPuttsForHole: (holeNumber, putts) =>
        setCurrent((c) => {
          if (!c) return c;
          const holes = c.holes.map((h) =>
            h.number === holeNumber ? { ...h, putts: Math.max(0, putts) } : h
          );
          return { ...c, holes };
        }),

      toggleFairwayHit: (holeNumber) =>
        setCurrent((c) => {
          if (!c) return c;
          const holes = c.holes.map((h) =>
            h.number === holeNumber ? { ...h, fairwayHit: !h.fairwayHit } : h
          );
          return { ...c, holes };
        }),

      toggleGreenInReg: (holeNumber) =>
        setCurrent((c) => {
          if (!c) return c;
          const holes = c.holes.map((h) =>
            h.number === holeNumber ? { ...h, greenInReg: !h.greenInReg } : h
          );
          return { ...c, holes };
        }),

      setPenaltiesForHole: (holeNumber, penalties) =>
        setCurrent((c) => {
          if (!c) return c;
          const holes = c.holes.map((h) =>
            h.number === holeNumber ? { ...h, penalties: Math.max(0, penalties) } : h
          );
          return { ...c, holes };
        }),

      // --- navigation between holes ---
      nextHole: () =>
        setCurrent((c) =>
          !c ? c : { ...c, currentIndex: Math.min(c.holesCount - 1, c.currentIndex + 1) }
        ),

      prevHole: () =>
        setCurrent((c) =>
          !c ? c : { ...c, currentIndex: Math.max(0, c.currentIndex - 1) }
        ),

      // --- finalize/save ---
      endRound: async () => {
        if (!current) return null;
        const payload = {
          date: current.date,
          holesCount: current.holesCount,
          holes: current.holes,             // strokes + stats + penalties
          course: current.course ?? null,
          weather: current.weather ?? null,  // saved in rounds table if present
        };
        const saved = await saveRound(payload);
        setCurrent(null);
        return saved;
      },

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
