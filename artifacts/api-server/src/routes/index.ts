import { Router, type IRouter } from "express";
import healthRouter from "./health";
import songsRouter from "./songs";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/songs", songsRouter);
router.use("/admin", adminRouter);

export default router;
