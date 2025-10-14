// hooks/useRecentRounds.ts
import { useCallback, useState } from "react";
import { getRounds } from "../db/rounds";

export function useRecentRounds(limit = 3, onError?: (e: unknown) => void) {
  const [rounds, setRounds] = useState<any[]>([]);
  const load = useCallback(async () => {
    try {
      const rows = await getRounds();
      setRounds((rows || []).slice(0, limit));
    } catch (e) {
      onError?.(e);
      setRounds([]);
    }
  }, [limit, onError]);
  return { rounds, load };
}
