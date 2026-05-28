/**
 * Browser fingerprinting utility for vote deduplication
 * Uses localStorage + simple hash of browser characteristics
 *
 * This is lightweight anti-spam, not cryptographic security.
 * For v1, this is sufficient for the expected usage scale.
 */

const FINGERPRINT_KEY = 'freestuff_voter_id';

/**
 * Generate a simple browser fingerprint based on available characteristics
 */
function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ];

  const fingerprint = components.join('|');

  // Simple hash function (djb2)
  let hash = 5381;
  for (let i = 0; i < fingerprint.length; i++) {
    hash = (hash << 5) + hash + fingerprint.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Get or create a persistent fingerprint for this browser
 * Stored in localStorage to maintain consistency across sessions
 */
export function getFingerprint(): string {
  // Check if we already have a fingerprint in localStorage
  let fingerprint = localStorage.getItem(FINGERPRINT_KEY);

  if (!fingerprint) {
    // Generate new fingerprint
    fingerprint = generateFingerprint();

    // Add random component for uniqueness
    const random = Math.random().toString(36).substring(2, 15);
    fingerprint = `${fingerprint}_${random}`;

    // Store it
    localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  }

  return fingerprint;
}

/**
 * Clear the stored fingerprint (useful for testing)
 */
export function clearFingerprint(): void {
  localStorage.removeItem(FINGERPRINT_KEY);
}
