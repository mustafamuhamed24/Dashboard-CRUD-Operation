
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { User } from "./AddUserDialog";
import { useToast } from "@/hooks/use-toast";

interface ResetPasswordDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordReset: (userId: number, email: string) => void;
}

export function ResetPasswordDialog({ 
  user, 
  open, 
  onOpenChange, 
  onPasswordReset 
}: ResetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleResetPassword = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onPasswordReset(user.id, user.email);
      setIsSubmitting(false);
      
      toast({
        title: "Password reset link sent",
        description: `A password reset link has been sent to ${user.email}`,
      });
      
      onOpenChange(false);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Reset the password for this user account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 text-amber-800 rounded-md">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="text-sm">
              A password reset link will be sent to the email address: <strong>{user.email}</strong>
            </p>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              The user will receive an email with instructions on how to create a new password.
              This link will expire after 24 hours for security reasons.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleResetPassword} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
