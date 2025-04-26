import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { insertAssignedActionSchema, ActionTemplate, User, UserRole, AssignedAction } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";

// Extend the schema to use in the form
const assignActionFormSchema = insertAssignedActionSchema.extend({
  actionTemplateId: z.coerce.number().positive(),
  childId: z.coerce.number().positive(),
  quantity: z.coerce.number().min(1).default(1),
  date: z.date(),
  description: z.string().nullable().optional(),
});

type AssignActionFormValues = z.infer<typeof assignActionFormSchema>;

// Enhanced type for the action
type EnhancedAction = AssignedAction & {
  actionTemplate?: ActionTemplate;
  child?: User;
  assignedByUser?: User;
};

type AssignActionFormProps = {
  open: boolean;
  onClose: () => void;
  action?: EnhancedAction;
};

export const AssignActionForm = ({ open, onClose, action }: AssignActionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Get list of action templates
  const { data: actionTemplates, isLoading: isLoadingTemplates } = useQuery<ActionTemplate[]>({
    queryKey: ["/api/action-templates"],
  });

  // Get list of family members
  const { data: familyMembers, isLoading: isLoadingMembers } = useQuery<User[]>({
    queryKey: ["/api/family-members"],
  });

  // Get only children from family members
  const children = familyMembers?.filter(member => member.role === UserRole.CHILD) || [];

  const form = useForm<AssignActionFormValues>({
    resolver: zodResolver(assignActionFormSchema),
    defaultValues: {
      actionTemplateId: action?.actionTemplateId,
      childId: action?.childId,
      quantity: action?.quantity || 1,
      description: action?.description || null,
      date: action?.date ? new Date(action.date) : new Date(),
    },
  });

  // Effect to update form values when action changes
  useEffect(() => {
    if (action) {
      form.reset({
        actionTemplateId: action.actionTemplateId,
        childId: action.childId,
        quantity: action.quantity,
        description: action.description,
        date: new Date(action.date),
      });
    }
  }, [action, form]);

  const onSubmit = async (values: AssignActionFormValues) => {
    setIsSubmitting(true);
    try {
      if (action) {
        // Update existing action
        await apiRequest("PATCH", `/api/assigned-actions/${action.id}`, values);
      } else {
        // Create new action
        await apiRequest("POST", "/api/assigned-actions", values);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/assigned-actions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assigned-actions/today"] });
      
      toast({
        title: action 
          ? t("action.updateSuccess") 
          : t("action.assignSuccess"),
        description: action 
          ? t("action.updateSuccessDescription") 
          : t("action.assignSuccessDescription"),
      });
      onClose();
    } catch (error) {
      console.error("Error submitting action:", error);
      toast({
        title: t("action.error"),
        description: t("action.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTemplates || isLoadingMembers) {
    return (
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="py-4 text-center">{t("common.loading")}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {action ? t("action.editAction") : t("action.assignAction")}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="childId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("action.selectChild")}</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={!!action}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("action.selectChild")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id.toString()}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="actionTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("action.template")}</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("action.selectTemplate")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {actionTemplates?.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name} ({template.points} pts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("action.quantity")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("action.date")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("action.pickDate")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("action.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("action.descriptionPlaceholder")}
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
                {action ? t("common.update") : t("action.assign")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};