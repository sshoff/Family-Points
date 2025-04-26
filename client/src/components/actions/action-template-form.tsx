import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { insertActionTemplateSchema, ActionTemplate } from "@shared/schema";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

// Extend the schema to use in the form
const actionTemplateFormSchema = insertActionTemplateSchema.omit({ familyId: true, createdBy: true }).extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  points: z.coerce.number(),
  description: z.string().nullable().optional(),
});

type ActionTemplateFormValues = z.infer<typeof actionTemplateFormSchema>;

type ActionTemplateFormProps = {
  open: boolean;
  onClose: () => void;
  template?: ActionTemplate;
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
      description: template?.description || null,
    },
  });

  // Effect to update form values when template changes
  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        points: template.points,
        description: template.description,
      });
    }
  }, [template, form]);

  const onSubmit = async (values: ActionTemplateFormValues) => {
    setIsSubmitting(true);
    try {
      if (template) {
        // Update existing template
        await apiRequest("PATCH", `/api/action-templates/${template.id}`, values);
      } else {
        // Create new template
        await apiRequest("POST", "/api/action-templates", values);
      }
      
      // Invalidate action templates query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/action-templates"] });
      
      toast({
        title: template 
          ? t("action.template.updateSuccess") 
          : t("action.template.createSuccess"),
        description: template 
          ? t("action.template.updateSuccessDescription") 
          : t("action.template.createSuccessDescription"),
      });
      onClose();
    } catch (error) {
      console.error("Error submitting template:", error);
      toast({
        title: t("action.template.error"),
        description: t("action.template.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {template 
              ? t("action.template.edit", { name: template.name }) 
              : t("action.template.create")}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("action.template.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("action.template.namePlaceholder")}
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
                  <FormLabel>
                    {t("action.template.points")}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({t("action.template.pointsNegativeAllowed")})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("action.template.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("action.template.descriptionPlaceholder")}
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
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