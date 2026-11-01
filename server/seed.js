import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";

import { User } from "./models/User.js";
import { Lead } from "./models/Lead.js";
import { Contact } from "./models/Contact.js";
import { Note } from "./models/Note.js";
import { Task } from "./models/Task.js";

// ============================================================
// CLARIOCRM DATABASE SEED
// ============================================================

const DEMO_USER = {
  name: "ClarioCRM Demo",
  email: "Demo@example.com",
  password: "demo123",
};

// ============================================================
// DATE HELPERS
// ============================================================

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// ============================================================
// SAMPLE LEADS
// ============================================================

const leadsData = [
  {
    name: "Aarav Sharma",
    company: "BrightTech Solutions",
    email: "aarav@brighttech.example",
    phone: "+91 9876510001",
    status: "New",
    source: "Website",
    value: 125000,
    notes: "Interested in CRM automation.",
  },
  {
    name: "Priya Reddy",
    company: "Nova Retail",
    email: "priya@novaretail.example",
    phone: "+91 9876510002",
    status: "Contacted",
    source: "Referral",
    value: 85000,
    notes: "Requested a product demonstration.",
  },
  {
    name: "Rahul Verma",
    company: "Vertex Digital",
    email: "rahul@vertexdigital.example",
    phone: "+91 9876510003",
    status: "Qualified",
    source: "LinkedIn",
    value: 210000,
    notes: "Qualified enterprise opportunity.",
  },
  {
    name: "Sneha Iyer",
    company: "GreenField Ventures",
    email: "sneha@greenfield.example",
    phone: "+91 9876510004",
    status: "Proposal",
    source: "Website",
    value: 175000,
    notes: "Proposal sent for review.",
  },
  {
    name: "Karthik Rao",
    company: "Apex Manufacturing",
    email: "karthik@apexmanufacturing.example",
    phone: "+91 9876510005",
    status: "Negotiation",
    source: "Campaign",
    value: 320000,
    notes: "Discussing enterprise pricing.",
  },
  {
    name: "Meera Nair",
    company: "BlueSky Education",
    email: "meera@blueskyedu.example",
    phone: "+91 9876510006",
    status: "Won",
    source: "Referral",
    value: 95000,
    notes: "Successfully converted.",
  },
];

// ============================================================
// SAMPLE CONTACTS
// ============================================================

const contactsData = [
  {
    name: "Ananya Kapoor",
    email: "ananya@brighttech.example",
    phone: "+91 9876520001",
    company: "BrightTech Solutions",
    title: "Operations Manager",
  },
  {
    name: "Vikram Singh",
    email: "vikram@novaretail.example",
    phone: "+91 9876520002",
    company: "Nova Retail",
    title: "Sales Director",
  },
  {
    name: "Divya Menon",
    email: "divya@vertexdigital.example",
    phone: "+91 9876520003",
    company: "Vertex Digital",
    title: "Founder",
  },
  {
    name: "Arjun Kumar",
    email: "arjun@greenfield.example",
    phone: "+91 9876520004",
    company: "GreenField Ventures",
    title: "Business Manager",
  },
];

// ============================================================
// SAMPLE NOTES
// ============================================================

const notesData = [
  {
    title: "BrightTech Discovery Call",
    content:
      "Discussed current sales workflow, team size, and CRM requirements.",
  },
  {
    title: "Nova Retail Follow-up",
    content: "Send the product walkthrough and pricing information.",
  },
  {
    title: "Enterprise Proposal",
    content: "Prepare an implementation timeline and enterprise proposal.",
  },
  {
    title: "Weekly Sales Review",
    content:
      "Review current pipeline, conversion rates, and pending opportunities.",
  },
];

// ============================================================
// SAMPLE TASKS
// ============================================================

const tasksData = [
  {
    title: "Follow up with Priya Reddy",
    description: "Share the product walkthrough and answer pricing questions.",
    status: "Pending",
    priority: "High",
    dueDate: daysFromNow(1),
  },
  {
    title: "Prepare Apex Manufacturing proposal",
    description: "Finalize enterprise pricing and implementation details.",
    status: "In Progress",
    priority: "High",
    dueDate: daysFromNow(3),
  },
  {
    title: "Schedule BrightTech discovery call",
    description: "Confirm availability with the operations team.",
    status: "Pending",
    priority: "Medium",
    dueDate: daysFromNow(5),
  },
  {
    title: "Review won opportunities",
    description: "Prepare the onboarding handoff for the converted account.",
    status: "Completed",
    priority: "Low",
    dueDate: daysAgo(1),
  },
];

// ============================================================
// SCHEMA HELPERS
// ============================================================

const filterSchemaFields = (Model, data) => {
  const schemaFields = Object.keys(Model.schema.paths);

  return Object.fromEntries(
    Object.entries(data).filter(([key]) => schemaFields.includes(key)),
  );
};

// Use only enum values accepted by the actual Mongoose schema.
const normalizeEnumFields = (Model, data) => {
  const normalized = { ...data };

  for (const [key, value] of Object.entries(normalized)) {
    const schemaPath = Model.schema.path(key);

    if (!schemaPath || !schemaPath.enumValues?.length) {
      continue;
    }

    const allowedValues = schemaPath.enumValues;

    if (!allowedValues.includes(value)) {
      const defaultValue =
        typeof schemaPath.defaultValue === "function"
          ? schemaPath.defaultValue()
          : schemaPath.defaultValue;

      const replacement = allowedValues.includes(defaultValue)
        ? defaultValue
        : allowedValues[0];

      console.warn(
        `[Seed] ${Model.modelName}.${key}: "${value}" is invalid. Using "${replacement}".`,
      );

      normalized[key] = replacement;
    }
  }

  return normalized;
};

// Attach the demo user as owner where supported.
const attachOwner = (Model, data, userId) => {
  const record = { ...data };

  if (Model.schema.path("owner")) {
    record.owner = userId;
  }

  if (Model.schema.path("user")) {
    record.user = userId;
  }

  return normalizeEnumFields(Model, filterSchemaFields(Model, record));
};

// Find and update an existing record or create a new one.
const upsertRecord = async (Model, filter, data) => {
  let record = await Model.findOne(filter);

  const safeData = normalizeEnumFields(Model, filterSchemaFields(Model, data));

  if (record) {
    Object.assign(record, safeData);
  } else {
    record = new Model(safeData);
  }

  await record.save();

  return record;
};

// ============================================================
// SEED DEMO USER
// ============================================================

const seedUser = async () => {
  let user = await User.findOne({
    email: {
      $regex: `^${DEMO_USER.email}$`,
      $options: "i",
    },
  });

  if (!user) {
    user = new User(DEMO_USER);
  } else {
    user.name = DEMO_USER.name;
    user.email = DEMO_USER.email;
    user.password = DEMO_USER.password;
  }

  // Relies on the existing User pre-save password hashing hook.
  await user.save();

  console.log("Demo user created or updated.");

  return user;
};

// ============================================================
// SEED LEADS
// ============================================================

const seedLeads = async (userId) => {
  const results = [];

  for (const item of leadsData) {
    const data = attachOwner(Lead, item, userId);

    const filter = {
      email: item.email,
      ...(Lead.schema.path("owner") ? { owner: userId } : {}),
    };

    const lead = await upsertRecord(Lead, filter, data);
    results.push(lead);
  }

  console.log(`${results.length} leads seeded.`);

  return results;
};

// ============================================================
// SEED CONTACTS
// ============================================================

const seedContacts = async (userId) => {
  const results = [];

  for (const item of contactsData) {
    const data = attachOwner(Contact, item, userId);

    const filter = {
      email: item.email,
      ...(Contact.schema.path("owner") ? { owner: userId } : {}),
    };

    const contact = await upsertRecord(Contact, filter, data);

    results.push(contact);
  }

  console.log(`${results.length} contacts seeded.`);

  return results;
};

// ============================================================
// SEED NOTES
// ============================================================

const seedNotes = async (userId) => {
  const results = [];

  for (const item of notesData) {
    const data = attachOwner(Note, item, userId);

    const filter = {
      title: item.title,
      ...(Note.schema.path("owner") ? { owner: userId } : {}),
    };

    const note = await upsertRecord(Note, filter, data);
    results.push(note);
  }

  console.log(`${results.length} notes seeded.`);

  return results;
};

// ============================================================
// SEED TASKS
// ============================================================

const seedTasks = async (userId) => {
  const results = [];

  for (const item of tasksData) {
    const data = attachOwner(Task, item, userId);

    const filter = {
      title: item.title,
      ...(Task.schema.path("owner") ? { owner: userId } : {}),
    };

    const task = await upsertRecord(Task, filter, data);
    results.push(task);
  }

  console.log(`${results.length} tasks seeded.`);

  return results;
};

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

const seedDatabase = async () => {
  try {
    console.log("Starting ClarioCRM database seeding...");

    await connectDB();

    console.log("MongoDB connected successfully.");

    const user = await seedUser();
    const userId = user._id;

    console.log("Demo account:", user.email);

    const [leads, contacts, notes, tasks] = await Promise.all([
      seedLeads(userId),
      seedContacts(userId),
      seedNotes(userId),
      seedTasks(userId),
    ]);

    console.log("\n================================");
    console.log("CLARIOCRM SEED SUMMARY");
    console.log("================================");

    console.log("Users: 1");
    console.log("Leads:", leads.length);
    console.log("Contacts:", contacts.length);
    console.log("Notes:", notes.length);
    console.log("Tasks:", tasks.length);

    console.log("\nDemo Login Credentials");
    console.log("Email: Demo@example.com");
    console.log("Password: demo123");

    console.log("\nDatabase seeding completed.");
  } catch (error) {
    console.error("Database seeding failed:");
    console.error(error);

    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    console.log("Database connection closed.");
  }
};

// ============================================================
// EXECUTE
// ============================================================

seedDatabase();
