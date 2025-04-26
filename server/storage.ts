import { families, users, actionTemplates, assignedActions, actionSuggestions, invitations } from "@shared/schema";
import { type User, type InsertUser, type Family, type InsertFamily, type ActionTemplate, type InsertActionTemplate, type AssignedAction, type InsertAssignedAction, type ActionSuggestion, type InsertActionSuggestion, type Invitation, type InsertInvitation } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
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
  
  sessionStore: session.SessionStore;
  
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

export const storage = new MemStorage();
