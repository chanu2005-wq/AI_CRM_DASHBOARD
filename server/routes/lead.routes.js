import { Router } from "express";
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLoad,
  reorderLoads,
} from "../controllers/lead.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.patch("/reorder", reorderLoads);
router.route("/").get(getLeads).post(createLead);
router.route("/:id").get(getLead).put(updateLead).delete(deleteLoad);

export default router;
