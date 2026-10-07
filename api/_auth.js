import { createClient } from '@supabase/supabase-js';
import { ADMIN_MASTER_EMAILS, LEGACY_PORTAL_EMAILS } from '../shared/auth-config.js';

const getBearerToken = (authorization = '') => {
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
};

export async function requireUser(req, res, { admin = false } = {}) {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(503).json({ error: 'Authentication service is not configured' });
    return null;
  }

  let user;
  let error;
  try {
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const result = await authClient.auth.getUser(token);
    user = result.data.user;
    error = result.error;
  } catch {
    res.status(503).json({ error: 'Authentication service temporarily unavailable' });
    return null;
  }

  if (error || !user || user.is_anonymous || !user.email) {
    const serviceRestricted = error?.status === 402 || /restricted|quota/i.test(error?.message || '');
    res.status(serviceRestricted ? 503 : 401).json({
      error: serviceRestricted ? 'Authentication service temporarily unavailable' : 'Invalid or expired session',
    });
    return null;
  }

  const email = user.email.toLowerCase();
  const hasPortalAccess = user.app_metadata?.portal_access === true || LEGACY_PORTAL_EMAILS.includes(email);
  if (!hasPortalAccess) {
    res.status(403).json({ error: 'Portal access required' });
    return null;
  }

  if (admin && !ADMIN_MASTER_EMAILS.includes(email)) {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }

  return user;
}
