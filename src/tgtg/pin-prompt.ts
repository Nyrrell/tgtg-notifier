import * as http from 'node:http';

import { logger } from '../common/logger.ts';
import { HOST, PORT } from '../config.ts';

export const promptPin = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

      if (url.pathname === '/submit') {
        const pin = url.searchParams.get('value')?.trim() ?? '';
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h3>PIN received, you can close this tab.</h3>');
        server.close();
        resolve(pin);
        return;
      }

      const page = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>TGTG - Code PIN</title></head>
<body style="font-family: system-ui; padding: 2rem;">
  <h2>Enter the PIN code received by email</h2>
  <form action="/submit" method="get">
    <input name="value" autofocus placeholder="123456"
      style="font-size: 1.4rem; padding: .4rem; width: 12rem;" />
    <button type="submit"
      style="font-size: 1.4rem; padding: .4rem .8rem; margin-left: .5rem;">OK</button>
  </form>
</body>
</html>`;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(page);
    });

    server.listen(PORT, () => {
      logger.info(`Enter your PIN here at http://${HOST}:${PORT}`);
    });

    server.on('error', reject);

    // Timeout 5 minutes
    setTimeout(
      () => {
        server.close();
        reject(new Error('Timeout PIN input (5 minutes)'));
      },
      5 * 60 * 1000
    );
  });
};
