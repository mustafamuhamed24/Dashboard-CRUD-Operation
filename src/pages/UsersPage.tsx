
import { useState, useEffect } from "react";
import AppShell from "@/components/layouts/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Filter, Search, MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AddUserDialog, User } from "@/components/users/AddUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { ViewUserProfileDialog } from "@/components/users/ViewUserProfileDialog";
import { ResetPasswordDialog } from "@/components/users/ResetPasswordDialog";
import { useToast } from "@/hooks/use-toast";

const UsersPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  
  // Get users from localStorage or initialize with sample data
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('caseGuardianUsers');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    
    // Initial user data if none in localStorage
    return [
      {
        id: 1,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "Administrator",
        department: "Legal",
        status: "Active",
        initials: "JS"
      },
      {
        id: 2,
        name: "Robert Johnson",
        email: "robert.johnson@example.com",
        role: "Case Manager",
        department: "Operations",
        status: "Active",
        initials: "RJ"
      },
      {
        id: 3,
        name: "Sarah Williams",
        email: "sarah.williams@example.com",
        role: "Investigator",
        department: "Field Work",
        status: "Away",
        initials: "SW"
      },
      {
        id: 4,
        name: "Michael Davis",
        email: "michael.davis@example.com",
        role: "Supervisor",
        department: "Management",
        status: "Active",
        initials: "MD"
      },
      {
        id: 5,
        name: "Lisa Brown",
        email: "lisa.brown@example.com",
        role: "Case Manager",
        department: "Operations",
        status: "Inactive",
        initials: "LB"
      },
    ];
  });

  // Persist users to localStorage when they change
  useEffect(() => {
    localStorage.setItem('caseGuardianUsers', JSON.stringify(users));
  }, [users]);

  // Sync between tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'caseGuardianUsers') {
        setUsers(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddUser = (newUser: User) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedUsers = [...users, {
        ...newUser,
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        initials: newUser.name.split(' ').map(n => n[0]).join(''),
        status: "Active"
      }];
      
      setUsers(updatedUsers);
      localStorage.setItem('caseGuardianUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: "User added successfully",
        description: `${newUser.name} has been added to the system.`,
      });
      setIsLoading(false);
    }, 800);
  };

  const handleDeactivateUser = (userId: number) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === "Inactive" ? "Active" : "Inactive" } 
          : user
      );
      
      setUsers(updatedUsers);
      localStorage.setItem('caseGuardianUsers', JSON.stringify(updatedUsers));
      
      const user = users.find(u => u.id === userId);
      if (user) {
        const newStatus = user.status === "Inactive" ? "activated" : "deactivated";
        toast({
          title: `User ${newStatus}`,
          description: `${user.name} has been ${newStatus}.`,
        });
      }
      setIsLoading(false);
    }, 500);
  };

  const handleViewProfile = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setViewProfileOpen(true);
    }
  };

  const handleEditUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setEditUserOpen(true);
    }
  };

  const handleResetPassword = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setResetPasswordOpen(true);
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedUsers = users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      
      setUsers(updatedUsers);
      localStorage.setItem('caseGuardianUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: "User updated successfully",
        description: `${updatedUser.name}'s information has been updated.`,
      });
      setIsLoading(false);
      setEditUserOpen(false);
    }, 800);
  };

  const handlePasswordReset = (userId: number, email: string) => {
    setIsLoading(true);
    // Simulate API call for password reset
    setTimeout(() => {
      toast({
        title: "Password Reset",
        description: `Password reset email sent to ${email}`,
      });
      setIsLoading(false);
      setResetPasswordOpen(false);
    }, 800);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case "Away":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Away</Badge>;
      case "Inactive":
        return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground mt-2">
              Manage system users and their permissions
            </p>
          </div>
          
          <AddUserDialog onUserAdded={handleAddUser} />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <CardTitle>System Users ({users.length})</CardTitle>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => setSearchTerm("")}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.initials}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewProfile(user.id)}>
                                View profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                Edit user
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                                Reset password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive flex items-center"
                                onClick={() => handleDeactivateUser(user.id)}
                              >
                                {user.status === "Inactive" ? (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Activate user
                                  </>
                                ) : (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Deactivate user
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {selectedUser && (
        <>
          <ViewUserProfileDialog 
            user={selectedUser} 
            open={viewProfileOpen} 
            onOpenChange={setViewProfileOpen} 
          />
          
          <EditUserDialog 
            user={selectedUser} 
            open={editUserOpen} 
            onOpenChange={setEditUserOpen}
            onUserUpdated={handleUpdateUser}
          />
          
          <ResetPasswordDialog 
            user={selectedUser} 
            open={resetPasswordOpen} 
            onOpenChange={setResetPasswordOpen}
            onPasswordReset={handlePasswordReset}
          />
        </>
      )}
    </AppShell>
  );
};

export default UsersPage;
