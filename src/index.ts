import express from "express";
import cors from "cors";
import router from "./router";
import { envs } from "./config/envs";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("dist"));

app.use("/api", router);

app.get("/", (_req, res) => {
  res.json({ message: "Goodbye World!" });
});

app.listen(envs.port, () => {
  console.log(`Server is running on port ${envs.port}`);
});
