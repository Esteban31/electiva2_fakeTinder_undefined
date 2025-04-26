
process.loadEnvFile()
import express from "express";
import { mongooseConnection } from "./src/infrastructure/databases/connection.js";

mongooseConnection()

import router from './src/application/routes/index.js'
import cors from 'cors'


const app = express();

app.use(
    cors({
      origin: "*",
      methods: ['GET', 'PUT', 'POST', 'DELETE']
    })
);


app.use(express.json())
app.use("/api",router);

app.listen(process.env.PORT)
console.log("Port listening on "+process.env.PORT);