import { useEffect, useState } from 'react';
import { getAutomations } from '../api/mockApi';
import type { AutomationAction } from '../types/workflow';

export function useAutomations() {
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const response = await getAutomations();
        if (mounted) {
          setActions(response);
          setError(null);
        }
      } catch {
        if (mounted) {
          setError('Failed to load automation actions.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { actions, loading, error };
}
