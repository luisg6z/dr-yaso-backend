import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { envs } from "./envs";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dr. Yaso API",
      version: "1.0.0",
      description: "Documentación de la API de Dr. Yaso",
    },
    servers: [
      {
        url: `http://localhost:${envs.port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/**/*.ts"], // Ajusta según dónde tengas tus rutas y controladores
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
