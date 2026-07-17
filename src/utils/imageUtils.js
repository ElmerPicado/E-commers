/**
 * Converts any Google Drive sharing URL into a direct embeddable image URL.
 * 
 * Uses lh3.googleusercontent.com which is Google's image CDN and works
 * reliably for <img> tags without CORS or redirect issues.
 * 
 * Supported input formats:
 *   - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://drive.google.com/uc?id=FILE_ID&export=view
 *   - https://drive.google.com/uc?export=view&id=FILE_ID
 * 
 * If the URL is not a Google Drive URL, it is returned unchanged.
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return url;

  const trimmed = url.trim();

  // Extract the file ID from any Google Drive URL format
  let fileId = null;

  // Match /file/d/FILE_ID
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) fileId = fileMatch[1];

  // Match open?id=FILE_ID
  if (!fileId) {
    const openMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openMatch) fileId = openMatch[1];
  }

  // Match uc?id=FILE_ID or uc?export=view&id=FILE_ID
  if (!fileId) {
    const ucMatch = trimmed.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (ucMatch) fileId = ucMatch[1];
  }

  if (fileId) {
    // lh3.googleusercontent.com/d/ID is Google's image CDN — works for embedding
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Not a Google Drive URL — return as-is (Supabase URLs, etc.)
  return url;
}
