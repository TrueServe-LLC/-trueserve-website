import crypto from 'crypto';

/**
 * Validate POS Webhook Signatures
 * ------------------------------
 * This ensures that incoming POST calls to our /api/webhook/pos/ endpoints
 * are actually from the legitimate provider (Toast, Square, etc.)
 */

/**
 * Validate Toast Signature
 * Uses standard HMAC-SHA256 signature verification.
 */
export function validateToastSignature(body: any, signature: string | null, secret?: string): boolean {
  if (!signature || !secret) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  const hash = hmac.update(JSON.stringify(body)).digest('hex');
  
  return hash === signature;
}

/**
 * Validate Square Signature
 * Square uses a BASE64 HMAC-SHA1 or SHA256 of the notification URL + Body.
 */
export function validateSquareSignature(url: string, body: string, signature: string | null, secret?: string): boolean {
  if (!signature || !secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(url + body);
  const hash = hmac.digest('base64');

  return hash === signature;
}

/**
 * Validate Clover Signature
 * Clover includes a signing-secret that you must use to verify the body.
 */
export function validateCloverSignature(body: string, signature: string | null, secret?: string): boolean {
  if (!signature || !secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const hash = hmac.update(body).digest('hex');

  return hash === signature;
}

/**
 * Validate Revel Signature
 */
export function validateRevelSignature(body: string, signature: string | null, secret?: string): boolean {
  if (!signature || !secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const hash = hmac.update(body).digest('hex');

  return hash === signature;
}

/**
 * Validate Lightspeed Signature
 */
export function validateLightspeedSignature(body: string, signature: string | null, secret?: string): boolean {
  if (!signature || !secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const hash = hmac.update(body).digest('hex');

  return hash === signature;
}
