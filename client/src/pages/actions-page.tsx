import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ActionTemplateList } from "@/components/actions/action-template-list";
import { AssignedActionsList } from "@/components/actions/assigned-actions-list";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ActionsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(navigator.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Check if user is head/parent (can manage) or child (can only view)
  const canManageActions = user?.role === UserRole.HEAD || user?.role === UserRole.PARENT;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('nav.actions')}</h1>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="templates">{t('actions.templates')}</TabsTrigger>
          <TabsTrigger value="assigned">{t('actions.assigned')}</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-6">
          <ActionTemplateList />
        </TabsContent>
        <TabsContent value="assigned" className="mt-6">
          <AssignedActionsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActionsPage;