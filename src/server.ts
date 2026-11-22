import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Log every request so you can see the SSR flow in the terminal:
 *   [PAGE] /products      → Angular renders this page on the server
 *   [API]  /api/products  → data request (from the server render, or from the browser)
 */
app.use((req, res, next) => {
  const isApi = req.path.startsWith('/api/');
  const isFile = /\.[a-z0-9]+$/i.test(req.path);
  if (isApi || !isFile) {
    const start = Date.now();
    res.on('finish', () =>
      console.log(`${isApi ? '[API] ' : '[PAGE]'} ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start} ms)`),
    );
  }
  next();
});

/**
 * Demo REST API. In a real app this data would come from a database.
 * The 400 ms delay makes it easy to notice that the server WAITS for the
 * data before it sends the HTML.
 */
const products = [
  { id: 1, name: 'Wireless Headphones', price: 2999, stock: 12, description: 'Noise-cancelling over-ear headphones with 30-hour battery life.' },
  { id: 2, name: 'Mechanical Keyboard', price: 4499, stock: 5, description: 'Hot-swappable switches, RGB lighting and an aluminium frame.' },
  { id: 3, name: 'USB-C Hub', price: 1599, stock: 30, description: '7-in-1 hub with HDMI 4K, SD card reader and 100 W charging.' },
  { id: 4, name: 'Webcam 1080p', price: 2199, stock: 0, description: 'Full HD webcam with dual microphones and a privacy cover.' },
];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

app.get('/api/products', async (req, res) => {
  await delay(400);
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  await delay(400);
  const product = products.find(p => p.id === Number(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
