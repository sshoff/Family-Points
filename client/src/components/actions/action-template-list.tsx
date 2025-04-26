import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ActionTemplate, UserRole } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ActionTemplateForm } from "./action-template-form";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export const ActionTemplateList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ActionTemplate | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ActionTemplate | null>(null);

  // Fetch action templates
  const { data: templates, isLoading } = useQuery<ActionTemplate[]>({
    queryKey: ["/api/action-templates"],
  });

  // Check if user is head/parent (can manage)
  const canManage = user?.role === UserRole.HEAD || user?.role === UserRole.PARENT;

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsFormOpen(true);
  };

  const handleEditTemplate = (template: ActionTemplate) => {
    setSelectedTemplate(template);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await apiRequest("DELETE", `/api/action-templates/${templateToDelete.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/action-templates"] });
      toast({
        title: t("action.template.deleteSuccess"),
        description: t("action.template.deleteSuccessDescription"),
      });
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      toast({
        title: t("action.template.error"),
        description: t("action.template.errorDescription"),
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (template: ActionTemplate) => {
    setTemplateToDelete(template);
    setDeleteConfirmOpen(true);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("action.template.title")}</h2>

        {canManage && (
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            {t("action.template.create")}
          </Button>
        )}
      </div>

      {!templates?.length ? (
        <div className="text-center py-8 border rounded-lg bg-background">
          <p className="text-muted-foreground">{t("action.template.noTemplates")}</p>
          {canManage && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleCreateTemplate}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("action.template.createFirst")}
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("action.template.name")}</TableHead>
                <TableHead>{t("action.template.description")}</TableHead>
                <TableHead className="text-right">{t("action.template.points")}</TableHead>
                {canManage && <TableHead className="text-right">{t("common.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={template.points >= 0 ? "default" : "destructive"}>
                      {template.points} {t("action.template.pointsUnit")}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">{t("common.edit")}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(template)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">{t("common.delete")}</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isFormOpen && (
        <ActionTemplateForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          template={selectedTemplate || undefined}
        />
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("action.template.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("action.template.confirmDeleteDescription")}
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