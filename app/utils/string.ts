/**
 * Based on Rails' String#squish
 *
 * @param str String to squish
 * @returns Squished string
 */
export function squish<T extends string | null | undefined>(str: T): T {
  if (str === null || str === undefined || str === '') {
    return str;
  } else {
    return str
      .trim()
      .replace(/\u200B/g, '') // remove zero-width spaces
      .replace(/\s+/g, ' ') as T; // squish multiple spaces into one
  }
}

/**
 * Escape any /$pecial/ RegExp characters in a string.
 *
 * @param {string} string String to escape
 * @returns {string} The escaped string
 */
export function escapeStringForRegex(string: string): string {
  // NOTE: This is taken from
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  return string.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&');
}
