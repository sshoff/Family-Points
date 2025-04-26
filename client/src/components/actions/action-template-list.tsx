import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ActionTemplateForm } from "./action-template-form";
import { ActionTemplate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

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

export const ActionTemplateList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ActionTemplate | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ActionTemplate | null>(null);

  const { data: actionTemplates, isLoading } = useQuery<ActionTemplate[]>({
    queryKey: ["/api/action-templates"],
  });

  const canManageTemplates = user?.role === UserRole.HEAD || user?.role === UserRole.PARENT;

  const handleAddNew = () => {
    setSelectedTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template: ActionTemplate) => {
    setSelectedTemplate(template);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/action-templates/${templateToDelete.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/action-templates"] });
      toast({
        title: t("action.deleteSuccess"),
        description: t("action.deleteSuccessDescription"),
      });
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      toast({
        title: t("action.error"),
        description: t("action.errorDescription"),
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("action.templates")}</h2>
        {canManageTemplates && (
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t("action.addNew")}
          </Button>
        )}
      </div>
      
      {actionTemplates?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t("action.noTemplates")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionTemplates?.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{template.name}</span>
                  <Badge variant={template.points > 0 ? "default" : "destructive"}>
                    {template.points > 0 ? "+" : ""}{template.points} {t("action.pts")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              {canManageTemplates && (
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDelete(template)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t("common.delete")}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
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
            <AlertDialogTitle>{t("action.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("action.confirmDeleteDescription")}
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