import { WebSocketServer } from "ws";
import dotenv from 'dotenv';
import { User } from "./User";

dotenv.config();

const wss = new WebSocketServer({port: 3002});

wss.on('connection', (ws) => {
  const user: User = new User(ws);
  wss.on('error', console.error);
  
  wss.on('close', () => {
    user.destroy();
    console.log('close');
  })
})