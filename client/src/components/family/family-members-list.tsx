import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { User, UserRole } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, UserX, Crown, ShieldCheck, User as UserIcon } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { InviteForm } from "./invite-form";

export const FamilyMembersList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<User | null>(null);

  // Fetch family members
  const { data: familyMembers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/family-members"],
  });

  // Fetch pending invitations
  const { data: pendingInvitations, isLoading: isLoadingInvitations } = useQuery({
    queryKey: ["/api/invitations"],
    // Only heads can view invitations
    enabled: user?.role === UserRole.HEAD,
  });

  // Check if user is a family head (can manage family)
  const isHead = user?.role === UserRole.HEAD;

  const handleInvite = () => {
    setIsInviteFormOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      await apiRequest("DELETE", `/api/family-members/${memberToRemove.id}`);
      
      // Invalidate family members query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      
      toast({
        title: t("family.memberRemoved"),
        description: t("family.memberRemovedDescription", { name: memberToRemove.name }),
      });
      setRemoveConfirmOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      toast({
        title: t("family.error"),
        description: t("family.errorDescription"),
        variant: "destructive",
      });
    }
  };

  const confirmRemoveMember = (member: User) => {
    setMemberToRemove(member);
    setRemoveConfirmOpen(true);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.HEAD:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case UserRole.PARENT:
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case UserRole.CHILD:
        return <UserIcon className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.HEAD:
        return t("family.roleHead");
      case UserRole.PARENT:
        return t("family.roleParent");
      case UserRole.CHILD:
        return t("family.roleChild");
      default:
        return role;
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("family.members")}</h2>
        {isHead && (
          <Button onClick={handleInvite}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t("family.inviteMember")}
          </Button>
        )}
      </div>
      
      {/* Family Members Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t("family.membersTitle")}</CardTitle>
          <CardDescription>{t("family.membersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("family.name")}</TableHead>
                <TableHead>{t("family.role")}</TableHead>
                <TableHead>{t("family.email")}</TableHead>
                {isHead && <TableHead className="text-right">{t("common.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {familyMembers?.length ? (
                familyMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        <span>{getRoleName(member.role)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.email || '-'}</TableCell>
                    {isHead && (
                      <TableCell className="text-right">
                        {member.id !== user?.id && member.role !== UserRole.HEAD && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => confirmRemoveMember(member)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            {t("family.remove")}
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isHead ? 4 : 3} className="text-center py-4 text-muted-foreground">
                    {t("family.noMembers")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Pending Invitations Table */}
      {isHead && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("family.pendingInvitations")}</CardTitle>
            <CardDescription>{t("family.pendingInvitationsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInvitations ? (
              <div className="text-center py-4">{t("common.loading")}</div>
            ) : pendingInvitations?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("family.email")}</TableHead>
                    <TableHead>{t("family.role")}</TableHead>
                    <TableHead>{t("family.status")}</TableHead>
                    <TableHead>{t("family.date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>{getRoleName(invitation.role)}</TableCell>
                      <TableCell>
                        <Badge variant={invitation.accepted ? "success" : "secondary"}>
                          {invitation.accepted 
                            ? t("family.invitationAccepted") 
                            : t("family.invitationPending")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {t("family.noInvitations")}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invite Form */}
      {isInviteFormOpen && (
        <InviteForm
          open={isInviteFormOpen}
          onClose={() => setIsInviteFormOpen(false)}
        />
      )}

      {/* Confirm Remove Member Dialog */}
      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("family.confirmRemove")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("family.confirmRemoveDescription", { name: memberToRemove?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("family.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};