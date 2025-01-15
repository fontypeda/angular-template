/**
 * Formats a duration in seconds to a human-readable string (mm:ss or hh:mm:ss)
 * @param seconds Total duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (!seconds) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  }
  return `${minutes}:${padZero(remainingSeconds)}`;
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}
