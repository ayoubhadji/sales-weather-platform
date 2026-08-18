export const getImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) {
    return "";
  }

  const normalized = imageUrl.trim();

  // Old local-upload URLs must never render again. They can be stored in older
  // records even when Azure is now the canonical image source.
  if (
    normalized.startsWith("/uploads/") ||
    normalized.startsWith("uploads/") ||
    normalized.includes("/uploads/") ||
    /https?:\/\/localhost(?::\d+)?\/uploads\//i.test(normalized)
  ) {
    return "";
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("//")) {
    return `https:${normalized}`;
  }

  if (normalized.startsWith("/")) {
    const apiBase = import.meta.env.VITE_API_URL || "";
    return `${apiBase}${normalized}`;
  }

  return normalized;
};
