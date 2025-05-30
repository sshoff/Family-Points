import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { UserRole } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Schema for invitation form
const inviteFormSchema = z.object({
  email: z.string().email(),
  role: z.enum([UserRole.PARENT, UserRole.CHILD]),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

type InviteFormProps = {
  open: boolean;
  onClose: () => void;
};

export const InviteForm = ({ open, onClose }: InviteFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: UserRole.CHILD,
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/invitations", values);
      
      // Invalidate family members query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      
      toast({
        title: t("family.inviteSuccess"),
        description: t("family.inviteSuccessDescription"),
      });
      onClose();
    } catch (error) {
      toast({
        title: t("family.inviteError"),
        description: t("family.inviteErrorDescription"),
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
          <DialogTitle>{t("family.inviteMember")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("family.email")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("family.role")}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("family.selectRole")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.PARENT}>{t("family.roleParent")}</SelectItem>
                      <SelectItem value={UserRole.CHILD}>{t("family.roleChild")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {t("family.sendInvite")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};