import { pgTable, text, serial, integer, timestamp, boolean, real, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export enum UserRole {
  HEAD = "head",
  PARENT = "parent",
  CHILD = "child",
}

// Family table
export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role", { enum: ["head", "parent", "child"] }).notNull(),
  familyId: integer("family_id").references(() => families.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Action templates table
export const actionTemplates = pgTable("action_templates", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id").references(() => families.id).notNull(),
  name: text("name").notNull(),
  points: real("points").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assigned actions table
export const assignedActions = pgTable("assigned_actions", {
  id: serial("id").primaryKey(),
  actionTemplateId: integer("action_template_id").references(() => actionTemplates.id).notNull(),
  childId: integer("child_id").references(() => users.id).notNull(),
  assignedBy: integer("assigned_by").references(() => users.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  description: text("description"),
  date: timestamp("date").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Action suggestions table
export const actionSuggestions = pgTable("action_suggestions", {
  id: serial("id").primaryKey(),
  actionTemplateId: integer("action_template_id").references(() => actionTemplates.id).notNull(),
  childId: integer("child_id").references(() => users.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  description: text("description"),
  date: timestamp("date").notNull(),
  status: text("status", { enum: ["pending", "approved", "declined"] }).notNull().default("pending"),
  decidedBy: integer("decided_by").references(() => users.id),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invitations table
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id").references(() => families.id).notNull(),
  email: text("email").notNull(),
  role: text("role", { enum: ["parent", "child"] }).notNull(),
  token: text("token").notNull().unique(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  accepted: boolean("accepted").default(false),
});

// Relations
export const familiesRelations = relations(families, ({ many }: { many: any }) => ({
  users: many(users),
  actionTemplates: many(actionTemplates),
  actionSuggestions: many(actionSuggestions),
  invitations: many(invitations)
}));

export const usersRelations = relations(users, ({ one, many }: { one: any, many: any }) => ({
  family: one(families, {
    fields: [users.familyId],
    references: [families.id]
  }),
  assignedActions: many(assignedActions, { relationName: "child_actions" }),
  assignedByMe: many(assignedActions, { relationName: "assigner_actions" }),
  createdTemplates: many(actionTemplates, { relationName: "creator" }),
  suggestions: many(actionSuggestions, { relationName: "suggester" }),
  decisionsMade: many(actionSuggestions, { relationName: "decider" }),
  invitationsCreated: many(invitations, { relationName: "inviter" })
}));

export const actionTemplatesRelations = relations(actionTemplates, ({ one, many }: { one: any, many: any }) => ({
  family: one(families, {
    fields: [actionTemplates.familyId],
    references: [families.id]
  }),
  creator: one(users, {
    fields: [actionTemplates.createdBy],
    references: [users.id],
    relationName: "creator"
  }),
  assignedActions: many(assignedActions),
  suggestions: many(actionSuggestions)
}));

export const assignedActionsRelations = relations(assignedActions, ({ one }: { one: any }) => ({
  actionTemplate: one(actionTemplates, {
    fields: [assignedActions.actionTemplateId],
    references: [actionTemplates.id]
  }),
  child: one(users, {
    fields: [assignedActions.childId],
    references: [users.id],
    relationName: "child_actions"
  }),
  assigner: one(users, {
    fields: [assignedActions.assignedBy],
    references: [users.id],
    relationName: "assigner_actions"
  })
}));

export const actionSuggestionsRelations = relations(actionSuggestions, ({ one }: { one: any }) => ({
  actionTemplate: one(actionTemplates, {
    fields: [actionSuggestions.actionTemplateId],
    references: [actionTemplates.id]
  }),
  child: one(users, {
    fields: [actionSuggestions.childId],
    references: [users.id],
    relationName: "suggester"
  }),
  decider: one(users, {
    fields: [actionSuggestions.decidedBy],
    references: [users.id],
    relationName: "decider"
  })
}));

export const invitationsRelations = relations(invitations, ({ one }: { one: any }) => ({
  family: one(families, {
    fields: [invitations.familyId],
    references: [families.id]
  }),
  createdBy: one(users, {
    fields: [invitations.createdBy],
    references: [users.id],
    relationName: "inviter"
  })
}));

// Schema validation
export const insertFamilySchema = createInsertSchema(families);
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertActionTemplateSchema = createInsertSchema(actionTemplates).omit({ id: true, createdAt: true });
export const insertAssignedActionSchema = createInsertSchema(assignedActions).omit({ id: true, createdAt: true });
export const insertActionSuggestionSchema = createInsertSchema(actionSuggestions).omit({ id: true, createdAt: true, status: true, decidedBy: true, decidedAt: true });
export const insertInvitationSchema = createInsertSchema(invitations).omit({ id: true, createdAt: true, accepted: true, token: true });

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  familyName: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Types
export type Family = typeof families.$inferSelect;
export type InsertFamily = typeof families.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type ActionTemplate = typeof actionTemplates.$inferSelect;
export type InsertActionTemplate = typeof actionTemplates.$inferInsert;

export type AssignedAction = typeof assignedActions.$inferSelect;
export type InsertAssignedAction = typeof assignedActions.$inferInsert;

export type ActionSuggestion = typeof actionSuggestions.$inferSelect;
export type InsertActionSuggestion = typeof actionSuggestions.$inferInsert;

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;

export type Register = z.infer<typeof registerSchema>;
export type Login = z.infer<typeof loginSchema>;
