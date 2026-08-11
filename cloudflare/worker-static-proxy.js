const PERMISSIONS_POLICY = 'browsing-topics=(), join-ad-interest-group=(), run-ad-auction=()';

export default {
  async fetch(request, env) {
    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);
    headers.set('Permissions-Policy', PERMISSIONS_POLICY);
    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
};
