import { handler } from '../../netlify/functions/page-admin.js';
import { run } from '../../cloudflare/adapter.js';

export const onRequest = (context) => run(handler, context);
