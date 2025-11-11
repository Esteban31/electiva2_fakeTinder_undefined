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
app.use(router);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const PORT = process.env.PORT || 4002;

server.listen(PORT, () => {
  console.log("User Server listening in port: " + PORT);
});
