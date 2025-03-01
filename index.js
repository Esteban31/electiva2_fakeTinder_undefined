
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

const PORT = 3000

app.use(express.json())
app.use("/api",router);

app.listen(PORT)
console.log("Port listening on "+PORT);