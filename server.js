
import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

// 1. Create HTTP Server
const server = http.createServer((req, res) => {
  fs.readFile('./public/index.html', (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading page');
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

// 2. Create WebSocket Server
const wss = new WebSocketServer({ server });

// 3. Listen for new connections
wss.on('connection', (socket, req) => {

  // 4. Get username from URL
  const username = new URL(req.url, "http://localhost").searchParams.get(
    "username",
  );

  // Broadcast join message to all clients
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({
      type: 'system',
      text: `${username} joined`
    }));
  });

  // 5. Listen for incoming messages
  socket.on('message', (message) => {
    const { username, text } = JSON.parse(message);

    // Broadcast chat message to all clients
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({
        type: 'chat',
        username,
        text
      }));
    });
  });

  // 6. Listen when a user disconnects
  socket.on('close', () => {
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({
        type: 'system',
        text: `${username} left`
      }));
    });
  });

});

// 7. Start the server
server.listen(PORT, () => {
  console.log('Chat server running at http://localhost:3001');
});
