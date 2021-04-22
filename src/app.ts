import 'dotenv/config';
import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { isBoom } from '@hapi/boom';
import { errors } from 'celebrate';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

import './database';
import routes from './routes';

const app = express();

const http = createServer(app);
const io = new Server(http);
app.use(cors());
app.use(helmet());
app.use(express.json());

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
