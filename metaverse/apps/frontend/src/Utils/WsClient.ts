const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('Connected to server');
};

ws.onclose = () => {
  console.log('Disconnected from server');
};

export default ws;

export const wss = new WebSocket('ws://localhost:3002');

wss.onopen = () => {
  console.log('connected to ws server 3002');
}

wss.onclose = () => {
  console.log('disconnected from server 3002');
}