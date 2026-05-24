import { useEffect, useState } from "react";

type RunEvent = {
  taskId?: string;
  status?: string;
  output?: unknown;
  type?: string;
  runId?: string;
  error?: string;
};

export const useRunStream = (runId: string) => {
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!runId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const eventSource = new EventSource(`${apiUrl}/api/runs/${runId}/stream`);

    eventSource.addEventListener("connected", () => {
      setConnected(true);
    });

    eventSource.addEventListener("workflow-update", (e) => {
      const data = JSON.parse(e.data) as RunEvent;
      setEvents((prev) => [...prev, data]);
    });

    eventSource.onerror = () => {
      eventSource.close();
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [runId]);

  return { events, connected };
};
