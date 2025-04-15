import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layouts/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, CheckSquare, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type NotificationType = "case" | "message" | "system" | "report";

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: NotificationType;
  link?: string;
}

const NotificationsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Initialize notifications state from localStorage or use mock data
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("caseGuardianNotifications");
    if (saved) return JSON.parse(saved);
    
    // Initial mock notifications
    return [
      {
        id: 1,
        title: "New case assigned",
        description: "Case #12345 has been assigned to you",
        time: "5 minutes ago",
        isRead: false,
        type: "case",
        link: "/cases/case-1"
      },
      {
        id: 2,
        title: "High priority case updated",
        description: "Case #12342 has been updated with new evidence",
        time: "1 hour ago",
        isRead: false,
        type: "case",
        link: "/cases/case-2"
      },
      {
        id: 3,
        title: "System update",
        description: "New features have been added to the system",
        time: "1 day ago",
        isRead: true,
        type: "system"
      },
      {
        id: 4,
        title: "New message from Sarah Williams",
        description: "Have you reviewed the latest evidence for case #12342?",
        time: "2 days ago",
        isRead: true,
        type: "message",
        link: "/messages"
      },
      {
        id: 5,
        title: "Cases report ready",
        description: "Monthly cases report is now available",
        time: "3 days ago",
        isRead: true,
        type: "report",
        link: "/reports"
      }
    ];
  });
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem("caseGuardianNotifications", JSON.stringify(notifications));
  }, [notifications]);
  
  const handleMarkAsRead = (id: number) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    );
    
    setNotifications(updatedNotifications);
    
    toast({
      title: "Notification marked as read",
    });
  };
  
  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true
    }));
    
    setNotifications(updatedNotifications);
    
    toast({
      title: "All notifications marked as read",
    });
  };
  
  const handleClearAll = () => {
    setNotifications([]);
    
    toast({
      title: "All notifications cleared",
    });
  };
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate to the appropriate page if a link is provided
    if (notification.link) {
      console.log("Navigating to:", notification.link);
      navigate(notification.link);
    }
  };
  
  const addNewNotification = (type: NotificationType) => {
    const newId = notifications.length > 0 
      ? Math.max(...notifications.map(n => n.id)) + 1 
      : 1;
    
    let newNotification: Notification;
    
    switch (type) {
      case "case":
        newNotification = {
          id: newId,
          title: "New case assigned",
          description: `Case #${Math.floor(10000 + Math.random() * 90000)} has been assigned to you`,
          time: "Just now",
          isRead: false,
          type: "case",
          link: "/cases"
        };
        break;
      case "message":
        newNotification = {
          id: newId,
          title: "New message received",
          description: "You have received a new message from team member",
          time: "Just now",
          isRead: false,
          type: "message",
          link: "/messages"
        };
        break;
      case "system":
        newNotification = {
          id: newId,
          title: "System maintenance",
          description: "Scheduled maintenance will occur tonight at 11 PM",
          time: "Just now",
          isRead: false,
          type: "system"
        };
        break;
      case "report":
        newNotification = {
          id: newId,
          title: "New report available",
          description: "Weekly case summary report is now available",
          time: "Just now",
          isRead: false,
          type: "report",
          link: "/reports"
        };
        break;
      default:
        newNotification = {
          id: newId,
          title: "New notification",
          description: "You have a new notification",
          time: "Just now",
          isRead: false,
          type: "system"
        };
    }
    
    setNotifications([newNotification, ...notifications]);
    
    toast({
      title: "New notification",
      description: newNotification.title,
    });
  };
  
  const filteredNotifications = (type: string) => {
    return notifications
      .filter(notification => 
        (type === "all" || notification.type === type) &&
        (searchTerm === "" || 
         notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         notification.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1);
  };
  
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your notifications
            </p>
          </div>
          
          <div className="flex gap-2 self-start">
            <Button 
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={notifications.every(n => n.isRead)}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
            <Button 
              variant="outline" 
              className="text-destructive hover:text-destructive"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => addNewNotification("case")}
          >
            Add Test Case Notification
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => addNewNotification("message")}
          >
            Add Test Message Notification
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => addNewNotification("system")}
          >
            Add Test System Notification
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => addNewNotification("report")}
          >
            Add Test Report Notification
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>
                  You have {notifications.filter(n => !n.isRead).length} unread notifications
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search notifications..." 
                    className="pl-8 w-[200px] md:w-[250px]"
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
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 h-auto">
                <TabsTrigger value="all" className="py-2">
                  All
                </TabsTrigger>
                <TabsTrigger value="case" className="py-2">
                  Cases
                </TabsTrigger>
                <TabsTrigger value="message" className="py-2">
                  Messages
                </TabsTrigger>
                <TabsTrigger value="system" className="py-2">
                  System
                </TabsTrigger>
              </TabsList>
              
              {["all", "case", "message", "system"].map(tabType => (
                <TabsContent key={tabType} value={tabType} className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Notification</TableHead>
                          <TableHead className="w-[150px]">Time</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNotifications(tabType).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                              No notifications found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredNotifications(tabType).map((notification) => (
                            <TableRow 
                              key={notification.id}
                              className={!notification.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""}
                            >
                              <TableCell 
                                className="cursor-pointer"
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex flex-col space-y-1">
                                  <p className="font-medium">{notification.title}</p>
                                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {notification.time}
                              </TableCell>
                              <TableCell>
                                {notification.isRead ? (
                                  <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Read</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Unread</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  {!notification.isRead && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(notification.id);
                                      }}
                                    >
                                      <CheckSquare className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNotifications(notifications.filter(n => n.id !== notification.id));
                                      toast({
                                        title: "Notification removed",
                                      });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default NotificationsPage;
