import { Router } from "express";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all task routes
router.use(protect);

// GET all tasks and CREATE a task
router.route("/").get(getTasks).post(createTask);

// GET, UPDATE, and DELETE a specific task
router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

export default router;
