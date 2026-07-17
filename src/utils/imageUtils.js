/**
 * Converts any Google Drive sharing URL into a direct image URL.
 * 
 * Supported formats:
 *   - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://drive.google.com/uc?id=FILE_ID&export=view
 * 
 * If the URL is not a Google Drive URL, it is returned unchanged.
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // Match /file/d/FILE_ID/view or /file/d/FILE_ID
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }

  // Match open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }

  // Match uc?id=FILE_ID (already formatted but missing export=view)
  const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucMatch && !url.includes('export=view')) {
    return `https://drive.google.com/uc?export=view&id=${ucMatch[1]}`;
  }

  // Not a Google Drive URL — return as-is
  return url;
}
