import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { insertActionTemplateSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Extend the schema to use in the form
const actionTemplateFormSchema = insertActionTemplateSchema.extend({
  points: z.coerce.number().min(-100).max(100),
});

type ActionTemplateFormValues = z.infer<typeof actionTemplateFormSchema>;

type ActionTemplateFormProps = {
  open: boolean;
  onClose: () => void;
  template?: {
    id: number;
    name: string;
    points: number;
  };
};

export const ActionTemplateForm = ({ open, onClose, template }: ActionTemplateFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<ActionTemplateFormValues>({
    resolver: zodResolver(actionTemplateFormSchema),
    defaultValues: {
      name: template?.name || "",
      points: template?.points || 0,
    },
  });

  const onSubmit = async (values: ActionTemplateFormValues) => {
    setIsSubmitting(true);
    try {
      if (template) {
        // Update existing template
        await apiRequest("PATCH", `/api/action-templates/${template.id}`, values);
        toast({
          title: t("action.updateSuccess"),
          description: t("action.updateSuccessDescription"),
        });
      } else {
        // Create new template
        await apiRequest("POST", "/api/action-templates", values);
        toast({
          title: t("action.createSuccess"),
          description: t("action.createSuccessDescription"),
        });
      }
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/action-templates"] });
      onClose();
    } catch (error) {
      toast({
        title: t("action.error"),
        description: t("action.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {template ? t("action.editAction") : t("action.createAction")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("action.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("action.namePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("action.points")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("action.pointsPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {template ? t("common.update") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};