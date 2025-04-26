import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { insertAssignedActionSchema, User, ActionTemplate, UserRole } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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
const assignActionFormSchema = insertAssignedActionSchema.omit({ assignedBy: true }).extend({
  actionTemplateId: z.coerce.number().positive(),
  childId: z.coerce.number().positive(),
  quantity: z.coerce.number().min(1).default(1),
  date: z.date(),
  description: z.string().nullable().optional(),
});

type AssignActionFormValues = z.infer<typeof assignActionFormSchema>;

type AssignActionFormProps = {
  open: boolean;
  onClose: () => void;
  action?: {
    id: number;
    actionTemplateId: number;
    childId: number;
    quantity: number;
    date: Date;
    description?: string | null;
  };
};

export const AssignActionForm = ({ open, onClose, action }: AssignActionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Get list of action templates
  const { data: actionTemplates, isLoading: isLoadingTemplates } = useQuery<ActionTemplate[]>({
    queryKey: ["/api/action-templates"],
  });

  // Get list of children from family members
  const { data: familyMembers, isLoading: isLoadingFamily } = useQuery<User[]>({
    queryKey: ["/api/family-members"],
  });

  const children = familyMembers?.filter(member => member.role === UserRole.CHILD) || [];

  const form = useForm<AssignActionFormValues>({
    resolver: zodResolver(assignActionFormSchema),
    defaultValues: {
      actionTemplateId: action?.actionTemplateId || undefined,
      childId: action?.childId || undefined,
      quantity: action?.quantity || 1,
      description: action?.description || null,
      date: action?.date ? new Date(action.date) : new Date(),
    },
  });

  const onSubmit = async (values: AssignActionFormValues) => {
    setIsSubmitting(true);
    try {
      if (action) {
        // Update existing assigned action
        await apiRequest("PATCH", `/api/assigned-actions/${action.id}`, values);
        toast({
          title: t("action.updateSuccess"),
          description: t("action.updateAssignedSuccessDescription"),
        });
      } else {
        // Create new assigned action
        await apiRequest("POST", "/api/assigned-actions", values);
        toast({
          title: t("action.assignSuccess"),
          description: t("action.assignSuccessDescription"),
        });
      }
      
      // Invalidate both assigned actions queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ["/api/assigned-actions"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/assigned-actions/today"] 
      });
      
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: t("action.error"),
        description: t("action.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingTemplates || isLoadingFamily;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {action ? t("action.editAssignedAction") : t("action.assignAction")}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-4 text-center">{t("common.loading")}</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="childId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("action.assignTo")}</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
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
                          disabled={(date) => date < new Date("1900-01-01")}
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
        )}
      </DialogContent>
    </Dialog>
  );
};