import { Router } from "express";
import { ProfileController } from "./controllers/profile.controller";
import { authMiddleware } from "./authMiddleware";

const router = Router();
const controller = new ProfileController();

router.post("/", controller.create.bind(controller));
router.get(
  "/username/:username/userId",
  controller.getUserIdByUsername.bind(controller),
);

router.use(authMiddleware);

router.get("/user/:userId", controller.getProfileByUserId.bind(controller));
router.get("/by-id/:userId", controller.getProfileByIdOrMe.bind(controller));
router.get("/me", controller.getMe.bind(controller));

router.patch("/me", controller.update.bind(controller));
router.post("/telegram", controller.connectTelegram.bind(controller));
router.patch("/roles/:userId", controller.setRolesByUserId.bind(controller));

export default router;
