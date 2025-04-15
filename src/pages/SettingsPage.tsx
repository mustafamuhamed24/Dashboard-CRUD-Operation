
import { useState, useEffect } from "react";
import AppShell from "@/components/layouts/AppShell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, CheckCircle2, Download, Save } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // User profile state
  const [firstName, setFirstName] = useState(user?.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name.split(' ')[1] || '');
  const [email, setEmail] = useState(user?.email || '');
  const [jobTitle, setJobTitle] = useState("Case Manager");
  
  // System preferences state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('caseGuardianDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [compactView, setCompactView] = useState(() => {
    const saved = localStorage.getItem('caseGuardianCompactView');
    return saved ? JSON.parse(saved) : false;
  });
  const [timezone, setTimezone] = useState(() => {
    const saved = localStorage.getItem('caseGuardianTimezone');
    return saved || "Eastern Time (ET)";
  });
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState({
    cases: true,
    messages: true,
    system: true
  });
  const [appNotifications, setAppNotifications] = useState({
    cases: true,
    messages: true,
    system: true
  });
  
  // Security settings state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    const saved = localStorage.getItem('caseGuardian2FA');
    return saved ? JSON.parse(saved) : false;
  });
  
  // 2FA setup dialog
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorSetupStep, setTwoFactorSetupStep] = useState(1);
  
  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('caseGuardianDarkMode', JSON.stringify(darkMode));
    localStorage.setItem('caseGuardianCompactView', JSON.stringify(compactView));
    localStorage.setItem('caseGuardianTimezone', timezone);
    localStorage.setItem('caseGuardian2FA', JSON.stringify(twoFactorEnabled));
  }, [darkMode, compactView, timezone, twoFactorEnabled]);
  
  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been successfully updated."
    });
  };
  
  const handleSavePreferences = () => {
    toast({
      title: "Preferences saved",
      description: "Your system preferences have been successfully saved."
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been successfully saved."
    });
  };
  
  const handleUpdatePassword = () => {
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate password update
    toast({
      title: "Password updated",
      description: "Your password has been successfully updated."
    });
    
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleGenerateStrongPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setNewPassword(password);
    setConfirmPassword(password);
    
    toast({
      title: "Strong password generated",
      description: "A new strong password has been generated. Don't forget to save it."
    });
  };
  
  const handleOpenTwoFactorDialog = () => {
    setShowTwoFactorDialog(true);
    setTwoFactorSetupStep(1);
    
    // Generate a random 6-digit code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setTwoFactorCode(randomCode);
  };
  
  const handleToggleTwoFactor = () => {
    if (twoFactorEnabled) {
      // Disabling 2FA
      setTwoFactorEnabled(false);
      localStorage.setItem('caseGuardian2FA', 'false');
      
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "Your account is now less secure. We recommend enabling 2FA for maximum security."
      });
    } else {
      // Enabling 2FA - open setup dialog
      handleOpenTwoFactorDialog();
    }
  };
  
  const handleVerifyTwoFactorCode = (userCode: string) => {
    if (userCode === twoFactorCode) {
      setTwoFactorEnabled(true);
      localStorage.setItem('caseGuardian2FA', 'true');
      setShowTwoFactorDialog(false);
      
      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now more secure with 2FA.",
        variant: "default"
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDownloadBackupCodes = () => {
    // Generate 10 random backup codes
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    
    // Create text content for download
    const content = "Case Guardian Backup Codes\n\n" + 
      "Keep these codes in a safe place. Each code can only be used once.\n\n" +
      codes.map((code, i) => `${i + 1}. ${code}`).join("\n");
    
    // Create blob and download link
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "case-guardian-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Go to step 3
    setTwoFactorSetupStep(3);
  };
  
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Tabs defaultValue="account" className="space-y-4">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 h-auto">
            <TabsTrigger value="account" className="py-2">
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="py-2">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="py-2">
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-col items-center justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl">
                        {user?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="mt-4">
                      Change Avatar
                    </Button>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input 
                        id="jobTitle" 
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveProfile} className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Customize your system experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <Switch 
                    id="theme" 
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact">Compact View</Label>
                    <p className="text-sm text-muted-foreground">
                      Use condensed tables and lists
                    </p>
                  </div>
                  <Switch 
                    id="compact"
                    checked={compactView}
                    onCheckedChange={setCompactView}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <p className="text-sm text-muted-foreground">
                      Current time zone: {timezone}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const newTimezone = prompt("Enter your time zone:", timezone);
                    if (newTimezone) setTimezone(newTimezone);
                  }}>
                    Change
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSavePreferences} className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Email Notifications</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-cases">Case Updates</Label>
                      <Switch 
                        id="email-cases" 
                        checked={emailNotifications.cases}
                        onCheckedChange={(checked) => 
                          setEmailNotifications({...emailNotifications, cases: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-messages">New Messages</Label>
                      <Switch 
                        id="email-messages" 
                        checked={emailNotifications.messages}
                        onCheckedChange={(checked) => 
                          setEmailNotifications({...emailNotifications, messages: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-system">System Notifications</Label>
                      <Switch 
                        id="email-system" 
                        checked={emailNotifications.system}
                        onCheckedChange={(checked) => 
                          setEmailNotifications({...emailNotifications, system: checked})
                        }
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="font-medium">In-App Notifications</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-cases">Case Updates</Label>
                      <Switch 
                        id="app-cases" 
                        checked={appNotifications.cases}
                        onCheckedChange={(checked) => 
                          setAppNotifications({...appNotifications, cases: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-messages">New Messages</Label>
                      <Switch 
                        id="app-messages" 
                        checked={appNotifications.messages}
                        onCheckedChange={(checked) => 
                          setAppNotifications({...appNotifications, messages: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-system">System Notifications</Label>
                      <Switch 
                        id="app-system" 
                        checked={appNotifications.system}
                        onCheckedChange={(checked) => 
                          setAppNotifications({...appNotifications, system: checked})
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleGenerateStrongPassword}>
                  Generate Strong Password
                </Button>
                <Button onClick={handleUpdatePassword}>Update Password</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorEnabled ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Your account is protected with 2FA
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Protect your account with 2FA
                        </span>
                      )}
                    </p>
                  </div>
                  <Switch 
                    id="2fa" 
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggleTwoFactor}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="outline"
                  onClick={handleOpenTwoFactorDialog}
                  disabled={!twoFactorEnabled}
                >
                  Manage 2FA
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 2FA Setup Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {twoFactorSetupStep === 1 ? "Set Up Two-Factor Authentication" : 
               twoFactorSetupStep === 2 ? "Download Backup Codes" :
               "Two-Factor Authentication Complete"}
            </DialogTitle>
            <DialogDescription>
              {twoFactorSetupStep === 1 ? "Verify your identity with this security code" :
               twoFactorSetupStep === 2 ? "Save these backup codes in a secure location" :
               "Your account is now protected with 2FA"}
            </DialogDescription>
          </DialogHeader>
          
          {twoFactorSetupStep === 1 && (
            <>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="text-2xl font-mono bg-gray-100 dark:bg-gray-800 p-4 rounded-md tracking-widest">
                  {twoFactorCode}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Enter this code in your authenticator app or enter it below to verify
                </p>
                <Input 
                  className="mt-4"
                  placeholder="Enter verification code"
                  onChange={(e) => {
                    if (e.target.value === twoFactorCode) {
                      setTwoFactorSetupStep(2);
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowTwoFactorDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setTwoFactorSetupStep(2)}
                >
                  Next
                </Button>
              </DialogFooter>
            </>
          )}
          
          {twoFactorSetupStep === 2 && (
            <>
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-sm text-center mb-4">
                  If you lose access to your authentication device, you can use these backup codes to sign in.
                  Each code can only be used once.
                </p>
                <Button 
                  variant="outline"
                  className="flex items-center"
                  onClick={handleDownloadBackupCodes}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup Codes
                </Button>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowTwoFactorDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setTwoFactorSetupStep(3)}
                >
                  Next
                </Button>
              </DialogFooter>
            </>
          )}
          
          {twoFactorSetupStep === 3 && (
            <>
              <div className="flex flex-col items-center justify-center py-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-center">
                  Two-factor authentication is now enabled for your account. 
                  Your account is now more secure.
                </p>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setTwoFactorEnabled(true);
                    localStorage.setItem('caseGuardian2FA', 'true');
                    setShowTwoFactorDialog(false);
                    
                    toast({
                      title: "Two-Factor Authentication Enabled",
                      description: "Your account is now more secure with 2FA.",
                    });
                  }}
                >
                  Complete Setup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default SettingsPage;
