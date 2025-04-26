import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ActionSuggestion, ActionTemplate, User, UserRole } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Check, X, MessageSquarePlus } from "lucide-react";
import { ActionSuggestionForm } from "./action-suggestion-form";

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

// Type for enhanced suggestion with associated data
type EnhancedSuggestion = ActionSuggestion & {
  actionTemplate?: ActionTemplate;
  child?: User;
  decidedBy?: User;
};

export const SuggestionsList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSuggestionFormOpen, setIsSuggestionFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("pending");

  // Fetch action suggestions
  const { data: suggestions, isLoading } = useQuery<EnhancedSuggestion[]>({
    queryKey: ["/api/action-suggestions"],
  });

  // Filter suggestions based on selected tab
  const filteredSuggestions = suggestions?.filter(suggestion => {
    if (activeTab === "all") return true;
    return suggestion.status === activeTab;
  });

  // Check if user is a parent or family head (can approve/decline)
  const canDecide = user?.role === UserRole.PARENT || user?.role === UserRole.HEAD;
  
  // Check if user is a child (can create suggestions)
  const canCreate = user?.role === UserRole.CHILD;

  const handleApproveSuggestion = async (suggestionId: number) => {
    try {
      await apiRequest("PATCH", `/api/action-suggestions/${suggestionId}/approve`, {});
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/action-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assigned-actions"] });
      
      toast({
        title: t("suggestion.approveSuccess"),
        description: t("suggestion.approveSuccessDescription"),
      });
    } catch (error) {
      toast({
        title: t("suggestion.error"),
        description: t("suggestion.errorDescription"),
        variant: "destructive",
      });
    }
  };

  const handleDeclineSuggestion = async (suggestionId: number) => {
    try {
      await apiRequest("PATCH", `/api/action-suggestions/${suggestionId}/decline`, {});
      
      // Invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/action-suggestions"] });
      
      toast({
        title: t("suggestion.declineSuccess"),
        description: t("suggestion.declineSuccessDescription"),
      });
    } catch (error) {
      toast({
        title: t("suggestion.error"),
        description: t("suggestion.errorDescription"),
        variant: "destructive",
      });
    }
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "declined":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return t("suggestion.statusPending");
      case "approved":
        return t("suggestion.statusApproved");
      case "declined":
        return t("suggestion.statusDeclined");
      default:
        return status;
    }
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
        <h2 className="text-2xl font-bold">{t("suggestion.title")}</h2>
        
        {canCreate && (
          <Button onClick={() => setIsSuggestionFormOpen(true)}>
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            {t("suggestion.createNew")}
          </Button>
        )}
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="pending">{t("suggestion.pending")}</TabsTrigger>
          <TabsTrigger value="approved">{t("suggestion.approved")}</TabsTrigger>
          <TabsTrigger value="all">{t("suggestion.all")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {!filteredSuggestions?.length ? (
            <div className="text-center py-8 border rounded-lg bg-background">
              <p className="text-muted-foreground">
                {activeTab === "pending" 
                  ? t("suggestion.noPending") 
                  : activeTab === "approved"
                  ? t("suggestion.noApproved")
                  : t("suggestion.noSuggestions")}
              </p>
              {canCreate && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsSuggestionFormOpen(true)}
                >
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  {t("suggestion.createFirst")}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuggestions.map((suggestion) => (
                <Card 
                  key={suggestion.id}
                  className={suggestion.status !== "pending" ? "bg-muted border-muted" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{suggestion.actionTemplate?.name}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(suggestion.status)}>
                        {getStatusLabel(suggestion.status)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {t("suggestion.madeBy")}: {suggestion.child?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {suggestion.description && (
                      <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {t("action.quantity")}: {suggestion.quantity}
                      </span>
                      <span className="font-medium">
                        {t("action.points")}: {
                          (suggestion.actionTemplate?.points || 0) * suggestion.quantity
                        }
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {t("action.forDate")}: {formatDate(suggestion.date)}
                    </div>
                    
                    {suggestion.status !== "pending" && suggestion.decidedBy && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {suggestion.status === "approved" 
                          ? t("suggestion.approvedBy") 
                          : t("suggestion.declinedBy")}: {suggestion.decidedBy.name}
                      </div>
                    )}
                  </CardContent>
                  
                  {canDecide && suggestion.status === "pending" && (
                    <CardFooter className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveSuggestion(suggestion.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {t("suggestion.approve")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeclineSuggestion(suggestion.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {t("suggestion.decline")}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {isSuggestionFormOpen && (
        <ActionSuggestionForm
          open={isSuggestionFormOpen}
          onClose={() => setIsSuggestionFormOpen(false)}
        />
      )}
    </div>
  );
};