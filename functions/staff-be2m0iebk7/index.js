import { handler } from '../../netlify/functions/page-staff.js';
import { run } from '../../cloudflare/adapter.js';

export const onRequest = (context) => run(handler, context);
