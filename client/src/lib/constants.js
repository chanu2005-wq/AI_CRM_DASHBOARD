/* Shared domain constants kept in one place so UI + filters stay in sync
   with the backend enums. */

export const LEAD_STAGES = ["New", "Qualified", "Proposal", "Won", "Lost"];

export const PIPELINE_STAGES = ["New", "Qualified", "Proposal", "Won", "Lost"];

export const LEAD_PRIORITIES = ["Low", "Medium", "High"];

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Cold Outreach",
  "Social",
  "Event",
  "Other",
];

export const TASK_STATUSES = ["Pending", "In Progress", "Completed"];
export const TASK_PRIORITIES = ["Low", "Medium", "High"];

/** Tailwind class tokens for each lead stage (badge + kanban accents). */
export const STAGE_STYLES = {
  New: { dot: "bg-terracotta-500", badge: "bg-terracotta-50 text-terracotta-700", bar: "bg-terracotta-500" },
  Qualified: {
    dot: "bg-coral-500",
    badge: "bg-coral-50 text-coral-700",
    bar: "bg-coral-500",
  },
  Proposal: {
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700",
    bar: "bg-orange-500",
  },
  Won: {
    dot: "bg-primary-600",
    badge: "bg-primary-50 text-primary-700",
    bar: "bg-primary-600",
  },
  Lost: { dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700", bar: "bg-rose-500" },
};

export const PRIORITY_STYLES = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-orange-50 text-orange-700",
  High: "bg-primary-50 text-primary-700",
};

export const TASK_STATUS_STYLES = {
  Pending: "bg-slate-100 text-slate-600",
  "In Progress": "bg-terracotta-50 text-terracotta-700",
  Completed: "bg-primary-50 text-primary-700",
};