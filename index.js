import process from 'process';
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { mongooseConnection } from "./src/infrastructure/databases/connection.js";
import router from './src/application/routes/index.js';
import cors from 'cors';

import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from './src/infrastructure/documentation/swaggerConfig.js';


process.loadEnvFile();


mongooseConnection();

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "*", 
    // methods: ['GET', 'PUT', 'POST', 'DELETE']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api", router);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));




// WebSocket connection
io.on("connection", (socket) => {

  console.log("New Client connected: " + socket.id);

  // Ejemplo de evento personalizado
  socket.on("chat", (data) => {
    console.log("Data received:", JSON.stringify(data));
    io.emit("chat", data);
  });

  socket.on("disconnect", () => {
    console.log("Client Disconnected: " + socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server listening in port: " + PORT);
});
