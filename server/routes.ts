import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { z } from "zod";
import {
  insertActionTemplateSchema,
  insertAssignedActionSchema,
  insertActionSuggestionSchema,
  insertInvitationSchema,
  UserRole
} from "@shared/schema";
import { randomBytes } from "crypto";

// Custom middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
};

// Middleware to check if user is a head or parent
const isHeadOrParent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user?.role === UserRole.HEAD || req.user?.role === UserRole.PARENT) {
    return next();
  }
  
  return res.status(403).json({ message: "Insufficient permissions" });
};

// Middleware to check if user is a head
const isHead = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user?.role === UserRole.HEAD) {
    return next();
  }
  
  return res.status(403).json({ message: "Insufficient permissions" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Get family members route
  app.get("/api/family-members", isAuthenticated, async (req, res) => {
    try {
      const familyMembers = await storage.getFamilyMembers(req.user!.familyId!);
      res.json(familyMembers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family members" });
    }
  });
  
  // Remove family member route (only for heads)
  app.delete("/api/family-members/:id", isHead, async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      
      // Check if the member exists and is in the user's family
      const member = await storage.getUser(memberId);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      if (member.familyId !== req.user!.familyId) {
        return res.status(403).json({ message: "You don't have permission to remove this member" });
      }
      
      // Prevent removing yourself or another head
      if (member.id === req.user!.id) {
        return res.status(400).json({ message: "You cannot remove yourself" });
      }
      
      if (member.role === UserRole.HEAD) {
        return res.status(400).json({ message: "You cannot remove another head" });
      }
      
      await storage.removeFamilyMember(memberId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove family member" });
    }
  });
  
  // Get invitations route (only for heads)
  app.get("/api/invitations", isHead, async (req, res) => {
    try {
      // Get all invitations for the user's family
      const invitations = await storage.getInvitations(req.user!.familyId!);
      
      res.json(invitations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });
  
  // Create invitation route (only for heads)
  app.post("/api/invitations", isHead, async (req, res) => {
    try {
      const { email, role } = req.body;
      
      // Validate the role
      if (role !== UserRole.PARENT && role !== UserRole.CHILD) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Create the invitation
      const invitation = await storage.createInvitation({
        email,
        role,
        familyId: req.user!.familyId!,
        createdBy: req.user!.id,
      });
      
      // TODO: Send invitation email
      
      res.status(201).json(invitation);
    } catch (error) {
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });
  
  // Accept invitation route (public)
  app.get("/api/invitations/:token/accept", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Find the invitation
      const invitation = await storage.getInvitationByToken(token);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      if (invitation.accepted) {
        return res.status(400).json({ message: "Invitation already accepted" });
      }
      
      // Mark the invitation as accepted
      await storage.acceptInvitation(token);
      
      // Redirect to the register page with the invitation token
      res.json({ 
        message: "Invitation accepted. Please register to join the family.",
        invitationToken: token
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

  // Action templates routes
  app.get("/api/action-templates", isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getActionTemplates(req.user!.familyId!);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch action templates" });
    }
  });

  app.post("/api/action-templates", isHeadOrParent, async (req, res) => {
    try {
      const data = insertActionTemplateSchema.parse({
        ...req.body,
        familyId: req.user!.familyId,
        createdBy: req.user!.id
      });
      
      const actionTemplate = await storage.createActionTemplate(data);
      res.status(201).json(actionTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create action template" });
    }
  });

  app.patch("/api/action-templates/:id", isHeadOrParent, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getActionTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Action template not found" });
      }
      
      if (template.familyId !== req.user!.familyId) {
        return res.status(403).json({ message: "You don't have permission to update this template" });
      }
      
      const data = insertActionTemplateSchema.partial().parse(req.body);
      const updatedTemplate = await storage.updateActionTemplate(templateId, data);
      
      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update action template" });
    }
  });

  app.delete("/api/action-templates/:id", isHeadOrParent, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getActionTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Action template not found" });
      }
      
      if (template.familyId !== req.user!.familyId) {
        return res.status(403).json({ message: "You don't have permission to delete this template" });
      }
      
      await storage.deleteActionTemplate(templateId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete action template" });
    }
  });

  // Assigned actions routes
  app.get("/api/assigned-actions", isAuthenticated, async (req, res) => {
    try {
      let actions;
      if (req.user!.role === UserRole.CHILD) {
        // Children can only see their own assigned actions
        actions = await storage.getAssignedActions(req.user!.id);
      } else {
        // Parents and heads can see all assigned actions for the family
        actions = await storage.getAssignedActionsForFamily(req.user!.familyId!);
      }
      
      // Enhance each action with its related action template
      const enhancedActions = await Promise.all(actions.map(async (action) => {
        const actionTemplate = await storage.getActionTemplate(action.actionTemplateId);
        const assignedByUser = await storage.getUser(action.assignedBy);
        const child = await storage.getUser(action.childId);
        
        return {
          ...action,
          actionTemplate,
          assignedByUser,
          child
        };
      }));
      
      res.json(enhancedActions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assigned actions" });
    }
  });

  app.get("/api/assigned-actions/today", isAuthenticated, async (req, res) => {
    try {
      const today = new Date();
      
      let actions;
      if (req.user!.role === UserRole.CHILD) {
        // Children can only see their own assigned actions
        actions = await storage.getAssignedActionsByDate(req.user!.id, today);
      } else {
        // Get all family children
        const familyMembers = await storage.getFamilyMembers(req.user!.familyId!);
        const children = familyMembers.filter(member => member.role === UserRole.CHILD);
        
        // Get today's actions for all children
        actions = [];
        for (const child of children) {
          const childActions = await storage.getAssignedActionsByDate(child.id, today);
          actions.push(...childActions);
        }
      }
      
      // Enhance each action with its related action template
      const enhancedActions = await Promise.all(actions.map(async (action) => {
        const actionTemplate = await storage.getActionTemplate(action.actionTemplateId);
        const assignedByUser = await storage.getUser(action.assignedBy);
        const child = await storage.getUser(action.childId);
        
        return {
          ...action,
          actionTemplate,
          assignedByUser,
          child
        };
      }));
      
      res.json(enhancedActions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's assigned actions" });
    }
  });

  app.post("/api/assigned-actions", isHeadOrParent, async (req, res) => {
    try {
      // Validate the request data
      const data = insertAssignedActionSchema.parse({
        ...req.body,
        assignedBy: req.user!.id
      });
      
      // Verify the action template belongs to the user's family
      const actionTemplate = await storage.getActionTemplate(data.actionTemplateId);
      if (!actionTemplate || actionTemplate.familyId !== req.user!.familyId) {
        return res.status(400).json({ message: "Invalid action template" });
      }
      
      // Verify the child belongs to the user's family
      const child = await storage.getUser(data.childId);
      if (!child || child.familyId !== req.user!.familyId || child.role !== UserRole.CHILD) {
        return res.status(400).json({ message: "Invalid child id" });
      }
      
      const assignedAction = await storage.createAssignedAction(data);
      res.status(201).json(assignedAction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create assigned action" });
    }
  });

  app.patch("/api/assigned-actions/:id", isAuthenticated, async (req, res) => {
    try {
      const actionId = parseInt(req.params.id);
      const action = await storage.getAssignedAction(actionId);
      
      if (!action) {
        return res.status(404).json({ message: "Assigned action not found" });
      }
      
      // Check if the user has permission to update this action
      if (req.user!.role === UserRole.CHILD) {
        if (action.childId !== req.user!.id) {
          return res.status(403).json({ message: "You don't have permission to update this action" });
        }
        
        // Children can only update the 'completed' status
        if (Object.keys(req.body).some(key => key !== 'completed')) {
          return res.status(403).json({ message: "You can only update the completed status" });
        }
      } else {
        // For heads and parents, check if the action is for someone in their family
        const child = await storage.getUser(action.childId);
        if (child?.familyId !== req.user!.familyId) {
          return res.status(403).json({ message: "You don't have permission to update this action" });
        }
      }
      
      const data = insertAssignedActionSchema.partial().parse(req.body);
      const updatedAction = await storage.updateAssignedAction(actionId, data);
      
      res.json(updatedAction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update assigned action" });
    }
  });

  app.patch("/api/assigned-actions/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const actionId = parseInt(req.params.id);
      const action = await storage.getAssignedAction(actionId);
      
      if (!action) {
        return res.status(404).json({ message: "Assigned action not found" });
      }
      
      // Check if the user has permission to complete this action
      if (req.user!.role === UserRole.CHILD && action.childId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to complete this action" });
      }
      
      if (req.user!.role !== UserRole.CHILD) {
        const child = await storage.getUser(action.childId);
        if (child?.familyId !== req.user!.familyId) {
          return res.status(403).json({ message: "You don't have permission to complete this action" });
        }
      }
      
      const updatedAction = await storage.updateAssignedAction(actionId, { completed: true });
      res.json(updatedAction);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete assigned action" });
    }
  });

  app.delete("/api/assigned-actions/:id", isHeadOrParent, async (req, res) => {
    try {
      const actionId = parseInt(req.params.id);
      const action = await storage.getAssignedAction(actionId);
      
      if (!action) {
        return res.status(404).json({ message: "Assigned action not found" });
      }
      
      // Check if the action is for a child in the user's family
      const child = await storage.getUser(action.childId);
      if (child?.familyId !== req.user!.familyId) {
        return res.status(403).json({ message: "You don't have permission to delete this action" });
      }
      
      await storage.deleteAssignedAction(actionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete assigned action" });
    }
  });

  // Action suggestions routes
  app.get("/api/action-suggestions", isAuthenticated, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      
      let suggestions;
      if (req.user!.role === UserRole.CHILD) {
        // Children can only see their own suggestions
        suggestions = Array.from((await storage.getActionSuggestions(req.user!.familyId!))
          .filter(s => s.childId === req.user!.id));
      } else {
        suggestions = await storage.getActionSuggestions(req.user!.familyId!, status);
      }
      
      // Enhance suggestions with related data
      const enhancedSuggestions = await Promise.all(suggestions.map(async (suggestion) => {
        const actionTemplate = await storage.getActionTemplate(suggestion.actionTemplateId);
        const child = await storage.getUser(suggestion.childId);
        let decidedBy = null;
        
        if (suggestion.decidedBy) {
          decidedBy = await storage.getUser(suggestion.decidedBy);
        }
        
        return {
          ...suggestion,
          actionTemplate,
          child,
          decidedBy
        };
      }));
      
      res.json(enhancedSuggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch action suggestions" });
    }
  });

  app.get("/api/action-suggestions/pending", isHeadOrParent, async (req, res) => {
    try {
      const suggestions = await storage.getActionSuggestions(req.user!.familyId!, "pending");
      
      // Enhance suggestions with related data
      const enhancedSuggestions = await Promise.all(suggestions.map(async (suggestion) => {
        const actionTemplate = await storage.getActionTemplate(suggestion.actionTemplateId);
        const child = await storage.getUser(suggestion.childId);
        
        return {
          ...suggestion,
          actionTemplate,
          child
        };
      }));
      
      res.json(enhancedSuggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending suggestions" });
    }
  });

  app.post("/api/action-suggestions", isAuthenticated, async (req, res) => {
    try {
      // Get the user's family
      const family = await storage.getFamily(req.user!.familyId!);
      if (!family) {
        return res.status(400).json({ message: "User is not part of a family" });
      }

      // Determine the child ID
      let childId: number;
      if (req.user!.role === UserRole.CHILD) {
        childId = req.user!.id;
      } else if (req.body.childId) {
        // Parents and heads can suggest actions for any child in their family
        const child = await storage.getUser(req.body.childId);
        if (!child || child.familyId !== req.user!.familyId || child.role !== UserRole.CHILD) {
          return res.status(400).json({ message: "Invalid child id" });
        }
        childId = req.body.childId;
      } else {
        return res.status(400).json({ message: "Child ID is required" });
      }

      // Validate the request data
      const data = insertActionSuggestionSchema.parse({
        ...req.body,
        childId
      });
      
      // Check if the action template belongs to the user's family
      const actionTemplate = await storage.getActionTemplate(data.actionTemplateId);
      if (!actionTemplate || actionTemplate.familyId !== req.user!.familyId) {
        return res.status(400).json({ message: "Invalid action template" });
      }
      
      // Create the suggestion
      const suggestion = await storage.createActionSuggestion(data);
      res.status(201).json(suggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create action suggestion" });
    }
  });

  app.patch("/api/action-suggestions/:id/approve", isHeadOrParent, async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const suggestion = await storage.getActionSuggestion(suggestionId);
      
      if (!suggestion) {
        return res.status(404).json({ message: "Action suggestion not found" });
      }
      
      // Check if the suggestion is for a child in the user's family
      const child = await storage.getUser(suggestion.childId);
      if (child?.familyId !== req.user!.familyId) {
        return res.status(403).json({ message: "You don't have permission to approve this suggestion" });
      }
      
      if (suggestion.status !== "pending") {
        return res.status(400).json({ message: "This suggestion has already been processed" });
      }
      
      const approvedSuggestion = await storage.approveActionSuggestion(suggestionId, req.user!.id);
      res.json(approvedSuggestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve action suggestion" });
    }
  });

  app.patch("/api/action-suggestions/:id/decline", isHeadOrParent, async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const suggestion = await storage.getActionSuggestion(suggestionId);
      
      if (!suggestion) {
        return res.status(404).json({ message: "Action suggestion not found" });
      }
      
      // Check if the suggestion is for a child in the user's family
      const child = await storage.getUser(suggestion.childId);
      if (child?.familyId !== req.user!.familyId) {
        return res.status(403).json({ message: "You don't have permission to decline this suggestion" });
      }
      
      if (suggestion.status !== "pending") {
        return res.status(400).json({ message: "This suggestion has already been processed" });
      }
      
      const declinedSuggestion = await storage.declineActionSuggestion(suggestionId, req.user!.id);
      res.json(declinedSuggestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to decline action suggestion" });
    }
  });

  // Family routes
  app.get("/api/family/members", isAuthenticated, async (req, res) => {
    try {
      if (!req.user!.familyId) {
        return res.status(400).json({ message: "User is not part of a family" });
      }
      
      const members = await storage.getFamilyMembers(req.user!.familyId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family members" });
    }
  });

  app.delete("/api/family/members/:id", isHead, async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      const member = await storage.getUser(memberId);
      
      if (!member) {
        return res.status(404).json({ message: "Family member not found" });
      }
      
      if (member.familyId !== req.user!.familyId) {
        return res.status(403).json({ message: "You don't have permission to remove this member" });
      }
      
      if (member.role === UserRole.HEAD) {
        return res.status(400).json({ message: "Cannot remove the head of the family" });
      }
      
      await storage.removeFamilyMember(memberId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove family member" });
    }
  });

  app.post("/api/family/invite", isHeadOrParent, async (req, res) => {
    try {
      const data = insertInvitationSchema.parse({
        ...req.body,
        familyId: req.user!.familyId,
        createdBy: req.user!.id
      });
      
      const invitation = await storage.createInvitation(data);
      
      // In a real app, you would send an email with the invitation token
      // For now, we'll just return the token in the response
      res.status(201).json({
        ...invitation,
        inviteUrl: `/api/family/accept-invite?token=${invitation.token}`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.get("/api/family/accept-invite", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res.status(400).json({ message: "Invitation token is required" });
      }
      
      const invitation = await storage.getInvitationByToken(token);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      if (invitation.accepted) {
        return res.status(400).json({ message: "Invitation has already been accepted" });
      }
      
      // In a real app, you would create a user account for the invited person here
      // For this example, we'll just mark the invitation as accepted
      await storage.acceptInvitation(token);
      
      res.json({ message: "Invitation accepted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

  // Reports routes
  app.get("/api/reports/points", isAuthenticated, async (req, res) => {
    try {
      const childId = parseInt(req.query.childId as string || "0");
      const startDate = new Date(req.query.startDate as string || "");
      const endDate = new Date(req.query.endDate as string || "");
      
      if (isNaN(childId) || !childId || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      // Verify the child belongs to the user's family
      const child = await storage.getUser(childId);
      if (!child || child.familyId !== req.user!.familyId) {
        return res.status(403).json({ message: "You don't have permission to view this child's points" });
      }
      
      const points = await storage.getChildPointsForPeriod(childId, startDate, endDate);
      res.json({ points });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch points report" });
    }
  });

  app.get("/api/reports/actions", isAuthenticated, async (req, res) => {
    try {
      const childId = parseInt(req.query.childId as string || "0");
      const startDate = new Date(req.query.startDate as string || "");
      const endDate = new Date(req.query.endDate as string || "");
      
      if (isNaN(childId) || !childId || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      // Verify the child belongs to the user's family
      const child = await storage.getUser(childId);
      if (!child || child.familyId !== req.user!.familyId) {
        return res.status(403).json({ message: "You don't have permission to view this child's actions" });
      }
      
      const actions = await storage.getChildActionsForPeriod(childId, startDate, endDate);
      
      // Enhance actions with related data
      const enhancedActions = await Promise.all(actions.map(async (action) => {
        const actionTemplate = await storage.getActionTemplate(action.actionTemplateId);
        const assignedByUser = await storage.getUser(action.assignedBy);
        
        return {
          ...action,
          actionTemplate,
          assignedByUser,
          totalPoints: actionTemplate ? actionTemplate.points * action.quantity : 0
        };
      }));
      
      res.json(enhancedActions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch actions report" });
    }
  });

  // Summary data for dashboard
  app.get("/api/summary", isAuthenticated, async (req, res) => {
    try {
      // Get the childId from query params if provided
      const childId = req.query.childId ? parseInt(req.query.childId as string) : null;
      
      // If specific child requested, check permissions
      if (childId) {
        const child = await storage.getUser(childId);
        if (!child || child.familyId !== req.user!.familyId) {
          return res.status(403).json({ message: "You don't have permission to view this child's data" });
        }
      }
      
      // Calculate date ranges
      const now = new Date();
      
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get target children
      let children: number[];
      if (childId) {
        children = [childId];
      } else if (req.user!.role === UserRole.CHILD) {
        children = [req.user!.id];
      } else {
        const familyMembers = await storage.getFamilyMembers(req.user!.familyId!);
        children = familyMembers
          .filter(member => member.role === UserRole.CHILD)
          .map(child => child.id);
      }
      
      // Calculate weekly and monthly points
      let weeklyPoints = 0;
      let monthlyPoints = 0;
      let completedActions = 0;
      
      for (const childId of children) {
        weeklyPoints += await storage.getChildPointsForPeriod(childId, weekStart, now);
        monthlyPoints += await storage.getChildPointsForPeriod(childId, monthStart, now);
        
        // Count completed actions
        const monthActions = await storage.getChildActionsForPeriod(childId, monthStart, now);
        completedActions += monthActions.filter(action => action.completed).length;
      }
      
      // Count pending suggestions
      let pendingSuggestions = 0;
      if (req.user!.role !== UserRole.CHILD) {
        const suggestions = await storage.getActionSuggestions(req.user!.familyId!, "pending");
        pendingSuggestions = suggestions.length;
      }
      
      res.json({
        weeklyPoints,
        monthlyPoints,
        completedActions,
        pendingSuggestions
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
