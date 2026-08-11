import { authenticate } from '../_lib/auth.js';
import { json, errorResponse } from '../_lib/respond.js';

export async function onRequestGet(context) {
  const result = await authenticate(context.request, context.env);
  if (result.status) {
    return errorResponse(result.status, result.reason);
  }
  const logoutUrl = `${context.env.TEAM_DOMAIN}/cdn-cgi/access/logout`;
  return json({ user: result.user, logoutUrl });
}
