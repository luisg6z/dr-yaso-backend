import { Router } from "express";
import franchiseRouter from "./franchises/franchises.router";
import volunteersRouter from "./volunteers/volunteer.router";


const router = Router();

router.use("/franchises", franchiseRouter);
router.use("/volunteers", volunteersRouter);

export default router;