import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Check, Edit, Trash2, PlusCircle, UserPlus } from "lucide-react";
import { AssignActionForm } from "./assign-action-form";
import { AssignedAction, ActionTemplate, User, UserRole } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Type for enhanced assigned action with associated data
type EnhancedAssignedAction = AssignedAction & {
  actionTemplate?: ActionTemplate;
  child?: User;
  assignedByUser?: User;
};

export const AssignedActionsList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<EnhancedAssignedAction | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<EnhancedAssignedAction | null>(null);
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [tabFilter, setTabFilter] = useState<string>("today");

  // Fetch family members for filters (Only for heads/parents)
  const { data: familyMembers } = useQuery<User[]>({
    queryKey: ["/api/family-members"],
    enabled: user?.role !== UserRole.CHILD,
  });

  // Get only children from family members
  const childrenOptions = familyMembers?.filter(member => member.role === UserRole.CHILD) || [];

  // Fetch assigned actions based on filter
  const { data: assignedActions, isLoading } = useQuery<EnhancedAssignedAction[]>({
    queryKey: [
      tabFilter === "today" ? "/api/assigned-actions/today" : "/api/assigned-actions",
      selectedChild !== "all" ? parseInt(selectedChild) : undefined,
    ],
  });

  const filteredActions = assignedActions?.filter(action => {
    if (selectedChild === "all") return true;
    return action.childId === parseInt(selectedChild);
  });

  // Check if user can manage actions (head or parent)
  const canManageActions = user?.role === UserRole.HEAD || user?.role === UserRole.PARENT;

  const handleAssignAction = () => {
    setSelectedAction(null);
    setIsFormOpen(true);
  };

  const handleMarkComplete = async (action: EnhancedAssignedAction) => {
    try {
      await apiRequest("PATCH", `/api/assigned-actions/${action.id}/complete`, {});
      queryClient.invalidateQueries({ 
        queryKey: ["/api/assigned-actions"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/assigned-actions/today"] 
      });
      toast({
        title: t("action.markCompleteSuccess"),
        description: t("action.markCompleteSuccessDescription"),
      });
    } catch (error) {
      toast({
        title: t("action.error"),
        description: t("action.errorDescription"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!actionToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/assigned-actions/${actionToDelete.id}`);
      queryClient.invalidateQueries({ 
        queryKey: ["/api/assigned-actions"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/assigned-actions/today"] 
      });
      toast({
        title: t("action.deleteSuccess"),
        description: t("action.deleteSuccessDescription"),
      });
      setDeleteConfirmOpen(false);
      setActionToDelete(null);
    } catch (error) {
      toast({
        title: t("action.error"),
        description: t("action.errorDescription"),
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (action: EnhancedAssignedAction) => {
    setActionToDelete(action);
    setDeleteConfirmOpen(true);
  };

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(navigator.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{t("action.assignedActions")}</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {canManageActions && childrenOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <Select
                value={selectedChild}
                onValueChange={setSelectedChild}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("action.selectChild")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("action.allChildren")}</SelectItem>
                  {childrenOptions.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {canManageActions && (
            <Button onClick={handleAssignAction}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("action.assignAction")}
            </Button>
          )}
        </div>
      </div>
      
      <Tabs 
        value={tabFilter} 
        onValueChange={setTabFilter}
        className="w-full"
      >
        <TabsList className="grid w-full md:w-[300px] grid-cols-2">
          <TabsTrigger value="today">{t("action.today")}</TabsTrigger>
          <TabsTrigger value="all">{t("action.allActions")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {!filteredActions?.length ? (
        <div className="text-center py-8 border rounded-lg bg-background">
          <p className="text-muted-foreground">{t("action.noAssignedActions")}</p>
          {canManageActions && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleAssignAction}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {t("action.assignFirst")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map((action) => (
            <Card 
              key={action.id}
              className={action.completed ? "bg-muted border-muted" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle>{action.actionTemplate?.name}</CardTitle>
                  <Badge variant={action.completed ? "outline" : "default"}>
                    {action.completed 
                      ? t("action.completed") 
                      : t("action.pending")}
                  </Badge>
                </div>
                <CardDescription>
                  {t("action.assignedTo")}: {action.child?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {action.description && (
                  <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                )}
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {t("action.quantity")}: {action.quantity}
                  </span>
                  <span className="font-medium">
                    {t("action.points")}: {
                      (action.actionTemplate?.points || 0) * action.quantity
                    }
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {t("action.forDate")}: {formatDate(action.date)}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                {!action.completed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkComplete(action)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {t("action.markComplete")}
                  </Button>
                )}
                {canManageActions && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDelete(action)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t("common.delete")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <AssignActionForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          action={selectedAction || undefined}
        />
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("action.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("action.confirmDeleteAssignedDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};