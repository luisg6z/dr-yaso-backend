import { Router } from "express";
import franchiseRouter from "./franchises/franchises.router";
import volunteersRouter from "./volunteers/volunteer.router";
import usersRouter from "./users/users.router";


const router = Router();

router.use("/franchises", franchiseRouter);
router.use("/volunteers", volunteersRouter);
router.use("/users", usersRouter);

export default router;