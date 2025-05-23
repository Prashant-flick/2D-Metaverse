import { WebSocketServer } from 'ws';
import { User } from './User';
import dotenv from 'dotenv'

dotenv.config()

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', function connection(ws) {
  const user: User = new User(ws);
  ws.on('error', console.error);

  ws.on('close', () => {
    user?.destroy();
  })
});