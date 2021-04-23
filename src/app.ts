import 'dotenv/config';
import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { isBoom } from '@hapi/boom';
import { errors } from 'celebrate';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { renderFile } from 'ejs';

import './database';
import routes from './routes';

const app = express();

const http = createServer(app);
const io = new Server(http);

const publicPath = path.join(__dirname, '..', 'public');

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json());

app.use(express.static(publicPath));
app.set('views', publicPath);
app.engine('html', renderFile);
app.set('view engine', 'html');

app.get('/pages/client', (request: Request, response: Response) => {
  return response.render('html/client.html');
});
app.get('/pages/admin', (request: Request, response: Response) => {
  return response.render('html/admin.html');
});

app.use('/v1', routes);

app.use(errors());
app.use(
  async (
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    if (isBoom(error)) {
      const { statusCode, payload } = error.output;

      return response.status(statusCode).json({
        ...payload,
        ...error.data,
        docs: process.env.DOCS_URL,
      });
    }

    return next(error);
  }
);

export { http, io };
