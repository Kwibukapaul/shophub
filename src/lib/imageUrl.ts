const hasUrlProtocol = (value: string) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);

const prepareUrl = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return hasUrlProtocol(trimmed) ? trimmed : `https://${trimmed}`;
};

export const normalizeOptionalImageUrl = (value: string) => {
  const prepared = prepareUrl(value);

  if (!prepared) {
    return null;
  }

  try {
    return new URL(prepared).toString();
  } catch {
    throw new Error(
      "Please enter a valid image URL, for example https://example.com/photo.jpg",
    );
  }
};

export const getImagePreviewUrl = (value: string) => {
  try {
    return normalizeOptionalImageUrl(value);
  } catch {
    return null;
  }
};
