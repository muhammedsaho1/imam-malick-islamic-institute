// Cloudflare adapter: lets the existing Netlify-style handlers
// (netlify/functions/*.js) run on Cloudflare Pages unchanged.
export async function run(handler, context) {
  const request = context.request;
  const url = new URL(request.url);

  // Copy Cloudflare variables/secrets (DATABASE_URL, AUTH_SECRET...) into
  // process.env, which is where the handlers read them.
  try {
    for (const [k, v] of Object.entries(context.env || {})) {
      if (typeof v === 'string') process.env[k] = v;
    }
  } catch (e) { /* process.env not writable: ignore */ }

  // Netlify-style headers object (lowercase keys)
  const headers = {};
  request.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  // The handlers read the client IP from x-forwarded-for / x-nf-client-connection-ip
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) {
    headers['x-forwarded-for'] = ip;
    headers['x-nf-client-connection-ip'] = ip;
  }
  headers['x-forwarded-host'] = url.host;
  headers['x-forwarded-proto'] = url.protocol.replace(':', '');

  const queryStringParameters = {};
  url.searchParams.forEach((v, k) => { queryStringParameters[k] = v; });

  const method = request.method.toUpperCase();
  const body = (method === 'GET' || method === 'HEAD') ? '' : await request.text();

  const result = await handler({
    httpMethod: method,
    path: url.pathname,
    headers,
    queryStringParameters,
    body,
    isBase64Encoded: false,
  });

  const res = result || { statusCode: 500, body: '' };
  const status = res.statusCode || 200;
  const noBody = status === 204 || status === 304 || method === 'HEAD';
  let out = null;
  if (!noBody) {
    if (res.isBase64Encoded && res.body) {
      // Pictures from the database come back as base64 text: send real bytes.
      const bin = atob(String(res.body));
      out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    } else {
      out = res.body == null ? '' : String(res.body);
    }
  }
  return new Response(out, {
    status,
    headers: res.headers || {},
  });
}
