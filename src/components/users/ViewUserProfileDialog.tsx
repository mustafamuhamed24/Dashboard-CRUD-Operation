
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "./AddUserDialog";

interface ViewUserProfileDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewUserProfileDialog({ user, open, onOpenChange }: ViewUserProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Viewing user details and information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{user.initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium">{user.role}</span>
            </div>
            
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium">{user.department}</span>
            </div>
            
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-muted-foreground">Status:</span>
              <span>
                {user.status === "Active" ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                ) : user.status === "Away" ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Away</Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Inactive</Badge>
                )}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
