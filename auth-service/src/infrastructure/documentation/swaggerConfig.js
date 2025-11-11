import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Fake Tinder API",
    version: "1.0.0",
    description: "Documentación de la API con Swagger",
  },
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "../application/routes/index.js")],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
