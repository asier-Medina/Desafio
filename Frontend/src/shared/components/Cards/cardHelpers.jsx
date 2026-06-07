export function formatDate(dateStr, lang) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(lang === "eu" ? "eu" : "es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function renderStars(rating) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="card__stars" aria-hidden="true">
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)}
    </span>
  );
}

export function getImage(data, variant) {
  if (variant === "event") {
    const raw = data.images;
    if (!raw) return "";
    if (Array.isArray(raw) && raw.length > 0) {
      return raw[0]?.imageUrl || raw[0]?.url || "";
    }
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0]?.imageUrl || parsed[0]?.url || "";
        }
      } catch {}
    }
    return "";
  }
  return data.url_imagen || data.imagen_url || "";
}
