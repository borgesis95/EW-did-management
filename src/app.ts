import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { initWithPrivateKeySigner } from 'iam-client-lib';

dotenv.config();
 
const key = process.env.PRIVATE_KEY || '';
const rpc = process.env.RPC_URL || ''


const myFunc  = async () => {
  const { signerService, messagingService, connectToCacheServer } = await initWithPrivateKeySigner(key, rpc);
  console.log("SIGNER ",signerService);
}

myFunc();


const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server sis running at http://localhost:${port}`);
});