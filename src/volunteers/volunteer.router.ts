import { Router } from "express";

import { volunteerController } from "./volunteer.controller";

const volunteersRouter = Router();
volunteersRouter.get("/", volunteerController);

export default volunteersRouter;