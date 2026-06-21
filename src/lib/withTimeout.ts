export const withTimeout = <T,>(promise: Promise<T>, ms = 5000): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });

  return Promise.race([promise, timeoutPromise]) as Promise<T>;
};

export default withTimeout;
