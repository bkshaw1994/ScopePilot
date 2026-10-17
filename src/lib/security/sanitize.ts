/**
 * Escapes unsafe HTML characters to prevent XSS.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips dangerous control characters and null bytes from raw user input.
 */
export function sanitizeRawInput(input: string): string {
  if (!input) return '';
  // Remove null bytes and non-printable controls (except \n, \r, \t)
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Delimits untrusted client requirements or text to defend against prompt injection.
 * Instructs the LLM boundary parser to treat the payload purely as passive data.
 */
export function wrapUntrustedClientText(rawText: string): string {
  const sanitized = sanitizeRawInput(rawText);
  return `<untrusted_client_request>\n${sanitized}\n</untrusted_client_request>`;
}
