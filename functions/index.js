import { handler } from '../netlify/functions/page-main.js';
import { run } from '../cloudflare/adapter.js';

export const onRequest = (context) => run(handler, context);
