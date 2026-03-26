import { useEffect, useMemo, useState } from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

const REMOTE_IMAGE_BLOCK_EVENT = "safe-image:block-remote";
const REMOTE_IMAGE_BLOCK_MS = 60_000;
let remoteImageBlockUntil = 0;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const createFallbackImage = (label: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#e5e7eb" />
      <rect x="40" y="40" width="560" height="400" rx="24" fill="#d1d5db" />
      <text x="320" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="#374151">
        Image unavailable
      </text>
      <text x="320" y="268" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">
        ${escapeXml(label)}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const isRemoteUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const isPexelsUrl = (value: string) => {
  try {
    return new URL(value).hostname.includes("pexels.com");
  } catch {
    return false;
  }
};

const optimizeRemoteUrl = (value: string) => {
  if (!isPexelsUrl(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    url.searchParams.set("auto", "compress");
    url.searchParams.set("cs", "tinysrgb");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", "800");
    url.searchParams.set("q", "80");
    return url.toString();
  } catch {
    return value;
  }
};

const areRemoteImagesBlocked = () => remoteImageBlockUntil > Date.now();

const blockRemoteImages = () => {
  remoteImageBlockUntil = Date.now() + REMOTE_IMAGE_BLOCK_MS;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(REMOTE_IMAGE_BLOCK_EVENT));
  }
};

export default function SafeImage({
  src,
  alt,
  className,
  fallbackLabel = "Check your connection and try again.",
}: SafeImageProps) {
  const isOnline = useOnlineStatus();
  const [hasFailed, setHasFailed] = useState(false);
  const [remoteImagesBlocked, setRemoteImagesBlocked] = useState(
    areRemoteImagesBlocked,
  );

  useEffect(() => {
    setHasFailed(false);
  }, [src, isOnline]);

  useEffect(() => {
    const syncRemoteImageBlock = () => {
      setRemoteImagesBlocked(areRemoteImagesBlocked());
    };

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(REMOTE_IMAGE_BLOCK_EVENT, syncRemoteImageBlock);
    window.addEventListener("online", syncRemoteImageBlock);

    return () => {
      window.removeEventListener(
        REMOTE_IMAGE_BLOCK_EVENT,
        syncRemoteImageBlock,
      );
      window.removeEventListener("online", syncRemoteImageBlock);
    };
  }, []);

  const fallbackSrc = useMemo(
    () => createFallbackImage(fallbackLabel),
    [fallbackLabel],
  );

  const optimizedSrc = useMemo(() => {
    if (!src || !isRemoteUrl(src)) {
      return src;
    }

    return optimizeRemoteUrl(src);
  }, [src]);

  const resolvedSrc =
    !optimizedSrc ||
    hasFailed ||
    (!isOnline && isRemoteUrl(optimizedSrc)) ||
    (remoteImagesBlocked && isRemoteUrl(optimizedSrc))
      ? fallbackSrc
      : optimizedSrc;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      onError={() => {
        if (optimizedSrc && isRemoteUrl(optimizedSrc)) {
          blockRemoteImages();
          setRemoteImagesBlocked(true);
        }

        setHasFailed(true);
      }}
    />
  );
}
