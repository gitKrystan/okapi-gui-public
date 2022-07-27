/**
 * Checks that the provided string is a single non-whitespace character
 */
export default function isPrintableCharacter(string: string): boolean {
  return string.length === 1 && /\S/.test(string);
}
