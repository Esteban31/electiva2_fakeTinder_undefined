
process.loadEnvFile()
import express from "express";

import router from './routes/index.js';
// import cors from 'cors'


const app = express();

// app.use(
//     cors({
//       origin: "*",
//       methods: ['GET', 'PUT', 'POST', 'DELETE']
//     })
// );


app.use(express.json())
app.use("/api",router);

app.listen(process.env.PORT)
console.log("Port listening on "+process.env.PORT);