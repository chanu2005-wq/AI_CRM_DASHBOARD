import { Task } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Get all tasks belonging to the authenticated user
export const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, relatedLead } = req.query;

  const filter = { owner: req.user._id };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (relatedLead) filter.relatedLead = relatedLead;

  const tasks = await Task.find(filter)
    .sort({ status: 1, dueDate: -1, createdAt: -1 })
    .populate("relatedLead", "name company")
    .populate("relatedContact", "name company");

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});

// Get a single task belonging to the authenticated user
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  })
    .populate("relatedLead", "name company")
    .populate("relatedContact", "name company");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.status(200).json({
    success: true,
    task,
  });
});

// Create a task
export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({
    ...req.body,
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    task,
  });
});

// Update a task
export const updateTask = asyncHandler(async (req, res) => {
  const { owner, ...updates } = req.body;

  if (updates.status === "Completed" && !updates.completedAt) {
    updates.completedAt = new Date();
  }

  if (updates.status && updates.status !== "Completed") {
    updates.completedAt = null;
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user._id,
    },
    updates,
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("relatedLead", "name company")
    .populate("relatedContact", "name company");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.status(200).json({
    success: true,
    task,
  });
});

// Delete a task
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.status(200).json({
    success: true,
    message: "Task was deleted",
  });
});
