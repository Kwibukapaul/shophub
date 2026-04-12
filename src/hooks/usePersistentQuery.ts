import { useEffect, useRef, useState } from "react";
import { getFriendlyErrorMessage, offlineMessage } from "../lib/errorHandling";

type QueryStatus = "idle" | "loading" | "success" | "error";

interface PersistedEntry<T> {
  data: T;
  updatedAt: number;
}

interface UsePersistentQueryOptions<T> {
  queryKey: string;
  fetcher: () => Promise<T>;
  enabled?: boolean;
  staleTimeMs?: number;
  timeoutMs?: number;
  fallbackError?: string;
  initialData?: T | null;
}

interface UsePersistentQueryResult<T> {
  data: T | null;
  error: string | null;
  status: QueryStatus;
  isLoading: boolean;
  isFetching: boolean;
  isReady: boolean;
  updatedAt: number | null;
  refetch: () => Promise<void>;
  setData: (updater: T | ((previous: T | null) => T)) => void;
  clear: () => void;
}

const STORAGE_PREFIX = "shophub-query-cache:";

const getStorageKey = (queryKey: string) => `${STORAGE_PREFIX}${queryKey}`;

const canUseStorage = () => typeof window !== "undefined";

const isBrowserOnline = () =>
  typeof navigator === "undefined" || navigator.onLine;

const readPersistedEntry = <T,>(queryKey: string): PersistedEntry<T> | null => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(queryKey));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedEntry<T>;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.updatedAt !== "number" ||
      !("data" in parsed)
    ) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn(`Failed to read persisted query "${queryKey}"`, error);
    return null;
  }
};

const writePersistedEntry = <T,>(queryKey: string, data: T) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    const payload: PersistedEntry<T> = {
      data,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(getStorageKey(queryKey), JSON.stringify(payload));
  } catch (error) {
    console.warn(`Failed to persist query "${queryKey}"`, error);
  }
};

const removePersistedEntry = (queryKey: string) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(getStorageKey(queryKey));
  } catch (error) {
    console.warn(`Failed to clear persisted query "${queryKey}"`, error);
  }
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number) => {
  let timeoutId: number | null = null;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error("Request timed out. Please try again."));
      }, timeoutMs);
    });

    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  }
};

const shouldRefetch = <T,>(cached: PersistedEntry<T> | null, staleTimeMs: number) => {
  if (!cached) {
    return true;
  }

  if (staleTimeMs <= 0) {
    return true;
  }

  return Date.now() - cached.updatedAt >= staleTimeMs;
};

export function usePersistentQuery<T>({
  queryKey,
  fetcher,
  enabled = true,
  staleTimeMs = 0,
  timeoutMs = 15000,
  fallbackError = "Unable to load data.",
  initialData = null,
}: UsePersistentQueryOptions<T>): UsePersistentQueryResult<T> {
  const fetcherRef = useRef(fetcher);
  const requestIdRef = useRef(0);
  const initialDataRef = useRef<T | null>(initialData);
  const previousQueryKeyRef = useRef(queryKey);
  const initialCache = readPersistedEntry<T>(queryKey);

  fetcherRef.current = fetcher;
  initialDataRef.current = initialData;

  const [state, setState] = useState<{
    data: T | null;
    error: string | null;
    status: QueryStatus;
    isFetching: boolean;
    updatedAt: number | null;
  }>(() => {
    const hasInitialData = initialCache?.data !== undefined || initialDataRef.current !== null;
    const online = isBrowserOnline();

    return {
      data: initialCache?.data ?? initialDataRef.current,
      error: !hasInitialData && enabled && !online ? offlineMessage : null,
      status: hasInitialData ? "success" : enabled ? (online ? "loading" : "error") : "idle",
      isFetching: false,
      updatedAt: initialCache?.updatedAt ?? null,
    };
  });

  const runFetch = async () => {
    if (!enabled) {
      return;
    }

    if (!isBrowserOnline()) {
      setState((previous) => ({
        ...previous,
        error: offlineMessage,
        status: previous.data === null ? "error" : "success",
        isFetching: false,
      }));
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    setState((previous) => ({
      ...previous,
      error: null,
      isFetching: true,
      status: previous.data === null ? "loading" : previous.status,
    }));

    try {
      const result = await withTimeout(fetcherRef.current(), timeoutMs);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      writePersistedEntry(queryKey, result);

      setState({
        data: result,
        error: null,
        status: "success",
        isFetching: false,
        updatedAt: Date.now(),
      });
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const message = getFriendlyErrorMessage(error, fallbackError);

      setState((previous) => ({
        ...previous,
        error: message,
        status: previous.data === null ? "error" : "success",
        isFetching: false,
      }));
    }
  };

  useEffect(() => {
    const cached = readPersistedEntry<T>(queryKey);
    const queryKeyChanged = previousQueryKeyRef.current !== queryKey;
    previousQueryKeyRef.current = queryKey;

    setState((previous) => {
      const fallbackData = cached?.data ?? initialDataRef.current;
      const nextData = queryKeyChanged
        ? fallbackData
        : cached?.data ?? previous.data ?? fallbackData;
      const online = isBrowserOnline();

      return {
        data: nextData,
        error: nextData === null && enabled && !online ? offlineMessage : null,
        status: nextData !== null ? "success" : enabled ? (online ? "loading" : "error") : "idle",
        isFetching: false,
        updatedAt: cached?.updatedAt ?? (queryKeyChanged ? null : previous.updatedAt),
      };
    });

    if (!enabled) {
      return;
    }

    if (!isBrowserOnline()) {
      setState((previous) => ({
        ...previous,
        error: offlineMessage,
        status: previous.data === null ? "error" : "success",
        isFetching: false,
      }));
      return;
    }

    if (!shouldRefetch(cached, staleTimeMs)) {
      return;
    }

    void runFetch();
  }, [enabled, queryKey, staleTimeMs]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleOnline = () => {
      setState((previous) => ({
        ...previous,
        error: null,
      }));

      if (enabled) {
        void runFetch();
      }
    };

    const handleOffline = () => {
      setState((previous) => ({
        ...previous,
        error: offlineMessage,
        status: previous.data === null ? "error" : "success",
        isFetching: false,
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [enabled, queryKey, timeoutMs]);

  const setData = (updater: T | ((previous: T | null) => T)) => {
    setState((previous) => {
      const nextData =
        typeof updater === "function"
          ? (updater as (previous: T | null) => T)(previous.data)
          : updater;

      writePersistedEntry(queryKey, nextData);

      return {
        data: nextData,
        error: null,
        status: "success",
        isFetching: false,
        updatedAt: Date.now(),
      };
    });
  };

  const clear = () => {
    requestIdRef.current += 1;
    removePersistedEntry(queryKey);
    setState({
      data: initialDataRef.current,
      error: null,
      status: initialDataRef.current !== null ? "success" : enabled ? "loading" : "idle",
      isFetching: false,
      updatedAt: null,
    });
  };

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    isLoading: state.status === "loading",
    isFetching: state.isFetching,
    isReady: state.status === "success" || state.status === "error",
    updatedAt: state.updatedAt,
    refetch: runFetch,
    setData,
    clear,
  };
}
