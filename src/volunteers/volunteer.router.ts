import { Router } from "express";

import { volunteerController } from "./volunteer.controller";

const router = Router();

router.get("/", volunteerController);

export default router;