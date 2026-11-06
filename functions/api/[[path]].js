import { handler } from '../../netlify/functions/api.js';
import { run } from '../../cloudflare/adapter.js';

export const onRequest = (context) => run(handler, context);
