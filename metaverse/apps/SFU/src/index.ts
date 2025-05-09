import { WebSocketServer } from "ws";
import dotenv from 'dotenv';
import { User } from "./User";

dotenv.config();

const wss = new WebSocketServer({port: 3002});

wss.on('connection', (ws) => {
  console.log('connected ws SFU');
  const user: User = new User(ws);
  ws.on('error', console.error);
  
  ws.on('close', () => {
    user?.destroy();
    console.log('close ws SFU');
  })
})