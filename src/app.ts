import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';


const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
export default app;
