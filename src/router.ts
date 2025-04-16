import { Router } from "express";
import franchiseRouter from "./franchises/franchises.router";
import volunteersRouter from "./volunteers/volunteer.router";
import usersRouter from "./users/users.router";
import occupationRouter from "./occupations/occupations.router";


const router = Router();

router.use("/franchises", franchiseRouter);
router.use("/volunteers", volunteersRouter);
router.use("/users", usersRouter);
router.use("/occupations", occupationRouter);

export default router;