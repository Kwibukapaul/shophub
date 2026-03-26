const NETWORK_ERROR_PATTERNS = [
  "failed to fetch",
  "networkerror",
  "load failed",
  "err_internet_disconnected",
  "err_name_not_resolved",
  "fetch failed",
];

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return "";
};

export const isLikelyNetworkError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();

  return NETWORK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
};

export const getFriendlyErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (!error) {
    return fallback;
  }

  if (isLikelyNetworkError(error)) {
    return "Can't reach Supabase right now. Check your internet connection, then try again.";
  }

  const message = getErrorMessage(error);
  return message || fallback;
};

export const offlineMessage =
  "You're offline. Reconnect to the internet to load data from Supabase.";
