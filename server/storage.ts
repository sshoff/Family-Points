import { families, users, actionTemplates, assignedActions, actionSuggestions, invitations } from "@shared/schema";
import { type User, type InsertUser, type Family, type InsertFamily, type ActionTemplate, type InsertActionTemplate, type AssignedAction, type InsertAssignedAction, type ActionSuggestion, type InsertActionSuggestion, type Invitation, type InsertInvitation } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { and, asc, between, desc, eq, gte, lte } from "drizzle-orm";
import { randomBytes } from "crypto";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  // Family methods
  getFamily(id: number): Promise<Family | undefined>;
  createFamily(family: InsertFamily): Promise<Family>;
  getFamilyMembers(familyId: number): Promise<User[]>;
  removeFamilyMember(id: number): Promise<void>;
  
  // Action template methods
  getActionTemplates(familyId: number): Promise<ActionTemplate[]>;
  getActionTemplate(id: number): Promise<ActionTemplate | undefined>;
  createActionTemplate(template: InsertActionTemplate): Promise<ActionTemplate>;
  updateActionTemplate(id: number, template: Partial<ActionTemplate>): Promise<ActionTemplate>;
  deleteActionTemplate(id: number): Promise<void>;
  
  // Assigned action methods
  getAssignedActions(childId: number): Promise<AssignedAction[]>;
  getAssignedActionsByDate(childId: number, date: Date): Promise<AssignedAction[]>;
  getAssignedActionsForFamily(familyId: number): Promise<AssignedAction[]>;
  getAssignedAction(id: number): Promise<AssignedAction | undefined>;
  createAssignedAction(action: InsertAssignedAction): Promise<AssignedAction>;
  updateAssignedAction(id: number, action: Partial<AssignedAction>): Promise<AssignedAction>;
  deleteAssignedAction(id: number): Promise<void>;
  
  // Action suggestion methods
  getActionSuggestions(familyId: number, status?: string): Promise<ActionSuggestion[]>;
  getActionSuggestion(id: number): Promise<ActionSuggestion | undefined>;
  createActionSuggestion(suggestion: InsertActionSuggestion): Promise<ActionSuggestion>;
  updateActionSuggestion(id: number, suggestion: Partial<ActionSuggestion>): Promise<ActionSuggestion>;
  approveActionSuggestion(id: number, decidedBy: number): Promise<ActionSuggestion>;
  declineActionSuggestion(id: number, decidedBy: number): Promise<ActionSuggestion>;
  
  // Invitation methods
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getInvitationByToken(token: string): Promise<Invitation | undefined>;
  acceptInvitation(token: string): Promise<Invitation>;
  
  // Reporting methods
  getChildPointsForPeriod(childId: number, startDate: Date, endDate: Date): Promise<number>;
  getChildActionsForPeriod(childId: number, startDate: Date, endDate: Date): Promise<AssignedAction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private families: Map<number, Family>;
  private actionTemplates: Map<number, ActionTemplate>;
  private assignedActions: Map<number, AssignedAction>;
  private actionSuggestions: Map<number, ActionSuggestion>;
  private invitations: Map<number, Invitation>;
  
  sessionStore: session.Store;
  
  userCurrentId: number;
  familyCurrentId: number;
  actionTemplateCurrentId: number;
  assignedActionCurrentId: number;
  actionSuggestionCurrentId: number;
  invitationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.families = new Map();
    this.actionTemplates = new Map();
    this.assignedActions = new Map();
    this.actionSuggestions = new Map();
    this.invitations = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    this.userCurrentId = 1;
    this.familyCurrentId = 1;
    this.actionTemplateCurrentId = 1;
    this.assignedActionCurrentId = 1;
    this.actionSuggestionCurrentId = 1;
    this.invitationCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Family methods
  async getFamily(id: number): Promise<Family | undefined> {
    return this.families.get(id);
  }
  
  async createFamily(insertFamily: InsertFamily): Promise<Family> {
    const id = this.familyCurrentId++;
    const now = new Date();
    const family: Family = { ...insertFamily, id, createdAt: now };
    this.families.set(id, family);
    return family;
  }
  
  async getFamilyMembers(familyId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.familyId === familyId
    );
  }
  
  async removeFamilyMember(id: number): Promise<void> {
    this.users.delete(id);
  }

  // Action template methods
  async getActionTemplates(familyId: number): Promise<ActionTemplate[]> {
    return Array.from(this.actionTemplates.values()).filter(
      (template) => template.familyId === familyId
    );
  }
  
  async getActionTemplate(id: number): Promise<ActionTemplate | undefined> {
    return this.actionTemplates.get(id);
  }
  
  async createActionTemplate(template: InsertActionTemplate): Promise<ActionTemplate> {
    const id = this.actionTemplateCurrentId++;
    const now = new Date();
    const actionTemplate: ActionTemplate = { ...template, id, createdAt: now };
    this.actionTemplates.set(id, actionTemplate);
    return actionTemplate;
  }
  
  async updateActionTemplate(id: number, templateData: Partial<ActionTemplate>): Promise<ActionTemplate> {
    const template = await this.getActionTemplate(id);
    if (!template) throw new Error("Action template not found");
    
    const updatedTemplate = { ...template, ...templateData };
    this.actionTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  async deleteActionTemplate(id: number): Promise<void> {
    this.actionTemplates.delete(id);
  }

  // Assigned action methods
  async getAssignedActions(childId: number): Promise<AssignedAction[]> {
    return Array.from(this.assignedActions.values())
      .filter((action) => action.childId === childId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getAssignedActionsByDate(childId: number, date: Date): Promise<AssignedAction[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.assignedActions.values())
      .filter((action) => {
        const actionDate = new Date(action.date);
        return action.childId === childId && 
               actionDate >= startOfDay && 
               actionDate <= endOfDay;
      });
  }
  
  async getAssignedActionsForFamily(familyId: number): Promise<AssignedAction[]> {
    const familyMembers = await this.getFamilyMembers(familyId);
    const childIds = familyMembers
      .filter(user => user.role === "child")
      .map(child => child.id);
    
    return Array.from(this.assignedActions.values())
      .filter(action => childIds.includes(action.childId));
  }
  
  async getAssignedAction(id: number): Promise<AssignedAction | undefined> {
    return this.assignedActions.get(id);
  }
  
  async createAssignedAction(action: InsertAssignedAction): Promise<AssignedAction> {
    const id = this.assignedActionCurrentId++;
    const now = new Date();
    const assignedAction: AssignedAction = { ...action, id, createdAt: now };
    this.assignedActions.set(id, assignedAction);
    return assignedAction;
  }
  
  async updateAssignedAction(id: number, actionData: Partial<AssignedAction>): Promise<AssignedAction> {
    const action = await this.getAssignedAction(id);
    if (!action) throw new Error("Assigned action not found");
    
    const updatedAction = { ...action, ...actionData };
    this.assignedActions.set(id, updatedAction);
    return updatedAction;
  }
  
  async deleteAssignedAction(id: number): Promise<void> {
    this.assignedActions.delete(id);
  }

  // Action suggestion methods
  async getActionSuggestions(familyId: number, status?: string): Promise<ActionSuggestion[]> {
    const familyMembers = await this.getFamilyMembers(familyId);
    const childIds = familyMembers
      .filter(user => user.role === "child")
      .map(child => child.id);
    
    let suggestions = Array.from(this.actionSuggestions.values())
      .filter(suggestion => childIds.includes(suggestion.childId));
    
    if (status) {
      suggestions = suggestions.filter(suggestion => suggestion.status === status);
    }
    
    return suggestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getActionSuggestion(id: number): Promise<ActionSuggestion | undefined> {
    return this.actionSuggestions.get(id);
  }
  
  async createActionSuggestion(suggestion: InsertActionSuggestion): Promise<ActionSuggestion> {
    const id = this.actionSuggestionCurrentId++;
    const now = new Date();
    const actionSuggestion: ActionSuggestion = { 
      ...suggestion, 
      id, 
      status: "pending", 
      createdAt: now 
    };
    this.actionSuggestions.set(id, actionSuggestion);
    return actionSuggestion;
  }
  
  async updateActionSuggestion(id: number, suggestionData: Partial<ActionSuggestion>): Promise<ActionSuggestion> {
    const suggestion = await this.getActionSuggestion(id);
    if (!suggestion) throw new Error("Action suggestion not found");
    
    const updatedSuggestion = { ...suggestion, ...suggestionData };
    this.actionSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }
  
  async approveActionSuggestion(id: number, decidedBy: number): Promise<ActionSuggestion> {
    const suggestion = await this.getActionSuggestion(id);
    if (!suggestion) throw new Error("Action suggestion not found");
    
    const now = new Date();
    const updatedSuggestion: ActionSuggestion = { 
      ...suggestion, 
      status: "approved", 
      decidedBy, 
      decidedAt: now 
    };
    
    this.actionSuggestions.set(id, updatedSuggestion);
    
    // Create an assigned action from the approved suggestion
    await this.createAssignedAction({
      actionTemplateId: suggestion.actionTemplateId,
      childId: suggestion.childId,
      assignedBy: decidedBy,
      quantity: suggestion.quantity,
      description: suggestion.description,
      date: suggestion.date,
      completed: false
    });
    
    return updatedSuggestion;
  }
  
  async declineActionSuggestion(id: number, decidedBy: number): Promise<ActionSuggestion> {
    const suggestion = await this.getActionSuggestion(id);
    if (!suggestion) throw new Error("Action suggestion not found");
    
    const now = new Date();
    const updatedSuggestion: ActionSuggestion = { 
      ...suggestion, 
      status: "declined", 
      decidedBy, 
      decidedAt: now 
    };
    
    this.actionSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }

  // Invitation methods
  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const id = this.invitationCurrentId++;
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const now = new Date();
    
    const newInvitation: Invitation = {
      ...invitation,
      id,
      token,
      accepted: false,
      createdAt: now
    };
    
    this.invitations.set(id, newInvitation);
    return newInvitation;
  }
  
  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    return Array.from(this.invitations.values()).find(
      invitation => invitation.token === token
    );
  }
  
  async acceptInvitation(token: string): Promise<Invitation> {
    const invitation = await this.getInvitationByToken(token);
    if (!invitation) throw new Error("Invitation not found");
    
    const updatedInvitation = { ...invitation, accepted: true };
    this.invitations.set(invitation.id, updatedInvitation);
    return updatedInvitation;
  }

  // Reporting methods
  async getChildPointsForPeriod(childId: number, startDate: Date, endDate: Date): Promise<number> {
    const actions = await this.getChildActionsForPeriod(childId, startDate, endDate);
    
    // Get all completed actions that have a related action template
    const completedActions = actions.filter(action => action.completed);
    
    // Sum up the points (points × quantity)
    let totalPoints = 0;
    
    for (const action of completedActions) {
      const actionTemplate = await this.getActionTemplate(action.actionTemplateId);
      if (actionTemplate) {
        totalPoints += actionTemplate.points * action.quantity;
      }
    }
    
    return totalPoints;
  }
  
  async getChildActionsForPeriod(childId: number, startDate: Date, endDate: Date): Promise<AssignedAction[]> {
    return Array.from(this.assignedActions.values())
      .filter(action => {
        const actionDate = new Date(action.date);
        return action.childId === childId && 
               actionDate >= startDate && 
               actionDate <= endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) throw new Error("User not found");
    return user;
  }

  // Family methods
  async getFamily(id: number): Promise<Family | undefined> {
    const [family] = await db.select().from(families).where(eq(families.id, id));
    return family;
  }
  
  async createFamily(insertFamily: InsertFamily): Promise<Family> {
    const [family] = await db.insert(families).values(insertFamily).returning();
    return family;
  }
  
  async getFamilyMembers(familyId: number): Promise<User[]> {
    return db.select().from(users).where(eq(users.familyId, familyId));
  }
  
  async removeFamilyMember(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Action template methods
  async getActionTemplates(familyId: number): Promise<ActionTemplate[]> {
    return db.select()
      .from(actionTemplates)
      .where(eq(actionTemplates.familyId, familyId));
  }
  
  async getActionTemplate(id: number): Promise<ActionTemplate | undefined> {
    const [template] = await db
      .select()
      .from(actionTemplates)
      .where(eq(actionTemplates.id, id));
    return template;
  }
  
  async createActionTemplate(template: InsertActionTemplate): Promise<ActionTemplate> {
    const [actionTemplate] = await db
      .insert(actionTemplates)
      .values(template)
      .returning();
    return actionTemplate;
  }
  
  async updateActionTemplate(id: number, templateData: Partial<ActionTemplate>): Promise<ActionTemplate> {
    const [updatedTemplate] = await db
      .update(actionTemplates)
      .set(templateData)
      .where(eq(actionTemplates.id, id))
      .returning();
    
    if (!updatedTemplate) throw new Error("Action template not found");
    return updatedTemplate;
  }
  
  async deleteActionTemplate(id: number): Promise<void> {
    await db.delete(actionTemplates).where(eq(actionTemplates.id, id));
  }

  // Assigned action methods
  async getAssignedActions(childId: number): Promise<AssignedAction[]> {
    return db.select()
      .from(assignedActions)
      .where(eq(assignedActions.childId, childId))
      .orderBy(desc(assignedActions.date));
  }
  
  async getAssignedActionsByDate(childId: number, date: Date): Promise<AssignedAction[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return db.select()
      .from(assignedActions)
      .where(
        and(
          eq(assignedActions.childId, childId),
          gte(assignedActions.date, startOfDay),
          lte(assignedActions.date, endOfDay)
        )
      );
  }
  
  async getAssignedActionsForFamily(familyId: number): Promise<AssignedAction[]> {
    // Get all child users in the family
    const familyChildren = await db.select()
      .from(users)
      .where(
        and(
          eq(users.familyId, familyId),
          eq(users.role, "child")
        )
      );
    
    const childIds = familyChildren.map(child => child.id);
    
    if (childIds.length === 0) {
      return [];
    }
    
    // Get all assigned actions for these children
    const actions: AssignedAction[] = [];
    for (const childId of childIds) {
      const childActions = await this.getAssignedActions(childId);
      actions.push(...childActions);
    }
    
    return actions;
  }
  
  async getAssignedAction(id: number): Promise<AssignedAction | undefined> {
    const [action] = await db
      .select()
      .from(assignedActions)
      .where(eq(assignedActions.id, id));
    return action;
  }
  
  async createAssignedAction(action: InsertAssignedAction): Promise<AssignedAction> {
    const [assignedAction] = await db
      .insert(assignedActions)
      .values(action)
      .returning();
    return assignedAction;
  }
  
  async updateAssignedAction(id: number, actionData: Partial<AssignedAction>): Promise<AssignedAction> {
    const [updatedAction] = await db
      .update(assignedActions)
      .set(actionData)
      .where(eq(assignedActions.id, id))
      .returning();
    
    if (!updatedAction) throw new Error("Assigned action not found");
    return updatedAction;
  }
  
  async deleteAssignedAction(id: number): Promise<void> {
    await db.delete(assignedActions).where(eq(assignedActions.id, id));
  }

  // Action suggestion methods
  async getActionSuggestions(familyId: number, status?: string): Promise<ActionSuggestion[]> {
    // Get all child users in the family
    const familyChildren = await db.select()
      .from(users)
      .where(
        and(
          eq(users.familyId, familyId),
          eq(users.role, "child")
        )
      );
    
    const childIds = familyChildren.map(child => child.id);
    
    if (childIds.length === 0) {
      return [];
    }
    
    // Build query conditions
    const conditions = [];
    
    // Add condition for each child ID (using IN operator would be better but we'll iterate for now)
    let suggestions: ActionSuggestion[] = [];
    
    for (const childId of childIds) {
      // Different approach for different status filters
      if (status) {
        const results = await db.select()
          .from(actionSuggestions)
          .where(and(
            eq(actionSuggestions.childId, childId),
            eq(actionSuggestions.status, status as "pending" | "approved" | "declined")
          ))
          .orderBy(desc(actionSuggestions.createdAt));
        
        suggestions.push(...results);
      } else {
        const results = await db.select()
          .from(actionSuggestions)
          .where(eq(actionSuggestions.childId, childId))
          .orderBy(desc(actionSuggestions.createdAt));
        
        suggestions.push(...results);
      }
    }
    
    return suggestions;
  }
  
  async getActionSuggestion(id: number): Promise<ActionSuggestion | undefined> {
    const [suggestion] = await db
      .select()
      .from(actionSuggestions)
      .where(eq(actionSuggestions.id, id));
    return suggestion;
  }
  
  async createActionSuggestion(suggestion: InsertActionSuggestion): Promise<ActionSuggestion> {
    const now = new Date();
    const [actionSuggestion] = await db
      .insert(actionSuggestions)
      .values({
        ...suggestion,
        status: "pending",
      })
      .returning();
    return actionSuggestion;
  }
  
  async updateActionSuggestion(id: number, suggestionData: Partial<ActionSuggestion>): Promise<ActionSuggestion> {
    const [updatedSuggestion] = await db
      .update(actionSuggestions)
      .set(suggestionData)
      .where(eq(actionSuggestions.id, id))
      .returning();
    
    if (!updatedSuggestion) throw new Error("Action suggestion not found");
    return updatedSuggestion;
  }
  
  async approveActionSuggestion(id: number, decidedBy: number): Promise<ActionSuggestion> {
    const now = new Date();
    
    // Update the suggestion status
    const [updatedSuggestion] = await db
      .update(actionSuggestions)
      .set({
        status: "approved",
        decidedBy,
        decidedAt: now
      })
      .where(eq(actionSuggestions.id, id))
      .returning();
    
    if (!updatedSuggestion) throw new Error("Action suggestion not found");
    
    // Create a new assigned action based on the approved suggestion
    await this.createAssignedAction({
      actionTemplateId: updatedSuggestion.actionTemplateId,
      childId: updatedSuggestion.childId,
      assignedBy: decidedBy,
      quantity: updatedSuggestion.quantity,
      description: updatedSuggestion.description,
      date: updatedSuggestion.date,
      completed: false
    });
    
    return updatedSuggestion;
  }
  
  async declineActionSuggestion(id: number, decidedBy: number): Promise<ActionSuggestion> {
    const now = new Date();
    
    const [updatedSuggestion] = await db
      .update(actionSuggestions)
      .set({
        status: "declined",
        decidedBy,
        decidedAt: now
      })
      .where(eq(actionSuggestions.id, id))
      .returning();
    
    if (!updatedSuggestion) throw new Error("Action suggestion not found");
    return updatedSuggestion;
  }

  // Invitation methods
  async getInvitations(familyId: number): Promise<Invitation[]> {
    return db.select()
      .from(invitations)
      .where(eq(invitations.familyId, familyId))
      .orderBy(desc(invitations.createdAt));
  }
  
  async createInvitation(invitationData: Omit<InsertInvitation, 'token'>): Promise<Invitation> {
    // Generate a random token
    const token = randomBytes(16).toString('hex');
    
    const [newInvitation] = await db
      .insert(invitations)
      .values({
        ...invitationData,
        token,
        accepted: false
      })
      .returning();
    
    return newInvitation;
  }
  
  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token));
    return invitation;
  }
  
  async acceptInvitation(token: string): Promise<Invitation> {
    const [updatedInvitation] = await db
      .update(invitations)
      .set({ accepted: true })
      .where(eq(invitations.token, token))
      .returning();
    
    if (!updatedInvitation) throw new Error("Invitation not found");
    return updatedInvitation;
  }

  // Reporting methods
  async getChildPointsForPeriod(childId: number, startDate: Date, endDate: Date): Promise<number> {
    // Get all completed actions in the date range
    const actions = await this.getChildActionsForPeriod(childId, startDate, endDate);
    const completedActions = actions.filter(action => action.completed);
    
    let totalPoints = 0;
    
    // For each action, get the template to find points value
    for (const action of completedActions) {
      const template = await this.getActionTemplate(action.actionTemplateId);
      if (template) {
        totalPoints += Number(template.points) * action.quantity;
      }
    }
    
    return totalPoints;
  }
  
  async getChildActionsForPeriod(childId: number, startDate: Date, endDate: Date): Promise<AssignedAction[]> {
    return db.select()
      .from(assignedActions)
      .where(
        and(
          eq(assignedActions.childId, childId),
          gte(assignedActions.date, startDate),
          lte(assignedActions.date, endDate)
        )
      )
      .orderBy(desc(assignedActions.date));
  }
}

// Export an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
