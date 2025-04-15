
import { useState } from "react";
import AppShell from "@/components/layouts/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Plus, Inbox, Archive } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: string;
  time: string;
  isOutgoing: boolean;
}

interface Conversation {
  id: number;
  user: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  userInitials: string;
  messages: Message[];
}

const MessagesPage = () => {
  const { toast } = useToast();

  // Initial conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      user: "Jane Smith",
      lastMessage: "Can you update me on case #45671?",
      time: "10:23 AM",
      unread: true,
      userInitials: "JS",
      messages: [
        {
          id: "1-1",
          text: "Hi, can you update me on case #45671? I need to prepare for the meeting tomorrow.",
          sender: "Jane Smith",
          time: "10:23 AM",
          isOutgoing: false
        }
      ]
    },
    {
      id: 2,
      user: "Robert Johnson",
      lastMessage: "Documents received for case #45892",
      time: "Yesterday",
      unread: false,
      userInitials: "RJ",
      messages: [
        {
          id: "2-1",
          text: "I've sent you the documents for case #45892.",
          sender: "Robert Johnson",
          time: "Yesterday",
          isOutgoing: false
        },
        {
          id: "2-2",
          text: "Thanks, I'll review them today.",
          sender: "You",
          time: "Yesterday",
          isOutgoing: true
        },
        {
          id: "2-3",
          text: "Documents received for case #45892",
          sender: "Robert Johnson",
          time: "Yesterday",
          isOutgoing: false
        }
      ]
    },
    {
      id: 3,
      user: "Sarah Williams",
      lastMessage: "Meeting scheduled for tomorrow",
      time: "Yesterday",
      unread: false,
      userInitials: "SW",
      messages: [
        {
          id: "3-1",
          text: "Meeting scheduled for tomorrow",
          sender: "Sarah Williams",
          time: "Yesterday",
          isOutgoing: false
        }
      ]
    },
    {
      id: 4,
      user: "Michael Davis",
      lastMessage: "Please review the updated case notes",
      time: "Monday",
      unread: true,
      userInitials: "MD",
      messages: [
        {
          id: "4-1",
          text: "Please review the updated case notes",
          sender: "Michael Davis",
          time: "Monday",
          isOutgoing: false
        }
      ]
    },
    {
      id: 5,
      user: "Lisa Brown",
      lastMessage: "New evidence submitted for review",
      time: "Last week",
      unread: false,
      userInitials: "LB",
      messages: [
        {
          id: "5-1",
          text: "New evidence submitted for review",
          sender: "Lisa Brown",
          time: "Last week",
          isOutgoing: false
        }
      ]
    },
  ]);

  const [activeConversationId, setActiveConversationId] = useState<number>(1);
  const [newMessage, setNewMessage] = useState("");

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversationId) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const newMsg: Message = {
          id: `${conv.id}-${conv.messages.length + 1}`,
          text: newMessage,
          sender: "You",
          time: timeStr,
          isOutgoing: true
        };
        
        return {
          ...conv,
          lastMessage: newMessage,
          time: timeStr,
          messages: [...conv.messages, newMsg]
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    setNewMessage("");
    
    toast({
      title: "Message sent",
      description: "Your message has been sent.",
    });
  };

  const handleSelectConversation = (convoId: number) => {
    setActiveConversationId(convoId);
    
    // Mark conversation as read
    setConversations(prev => 
      prev.map(conv => 
        conv.id === convoId 
          ? { ...conv, unread: false } 
          : conv
      )
    );
  };

  const handleNewMessage = () => {
    const newConversationId = Date.now();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newConvo: Conversation = {
      id: newConversationId,
      user: "New Conversation",
      lastMessage: "Start typing to begin conversation",
      time: timeStr,
      unread: false,
      userInitials: "NC",
      messages: []
    };
    
    setConversations([newConvo, ...conversations]);
    setActiveConversationId(newConversationId);
    
    toast({
      title: "New conversation",
      description: "You've started a new conversation.",
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground mt-2">
              Communicate with team members and clients
            </p>
          </div>
          
          <Button className="self-start flex items-center gap-2" onClick={handleNewMessage}>
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          {/* Conversations list */}
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle>Conversations</CardTitle>
                <Badge>{conversations.filter(c => c.unread).length}</Badge>
              </div>
              <Input placeholder="Search messages..." className="mt-2" />
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="inbox">
                <TabsList className="grid grid-cols-2 w-full rounded-none border-b border-t">
                  <TabsTrigger value="inbox" className="flex items-center gap-2">
                    <Inbox className="h-4 w-4" />
                    Inbox
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Archived
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="inbox" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    {conversations.map((conversation) => (
                      <div 
                        key={conversation.id} 
                        className={`p-4 border-b hover:bg-muted/50 cursor-pointer ${
                          conversation.unread ? 'bg-muted/30' : ''
                        } ${activeConversationId === conversation.id ? 'bg-muted' : ''}`}
                        onClick={() => handleSelectConversation(conversation.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{conversation.userInitials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{conversation.user}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {conversation.time}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unread && (
                              <div className="flex justify-end">
                                <Badge variant="default" className="mt-1">New</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="archived" className="mt-0">
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] p-4 text-center">
                    <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="font-medium">No archived messages</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Archived conversations will appear here
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Message detail */}
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="border-b p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{activeConversation.userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{activeConversation.user}</CardTitle>
                  <CardDescription>Last active recently</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[calc(100vh-22rem)]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {activeConversation.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="font-medium">No messages yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start the conversation by sending a message
                      </p>
                    </div>
                  ) : (
                    activeConversation.messages.map((message) => (
                      <div key={message.id} className={`flex gap-3 ${message.isOutgoing ? 'justify-end' : ''}`}>
                        {!message.isOutgoing && (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{activeConversation.userInitials}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`${message.isOutgoing 
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'} p-3 rounded-lg max-w-[80%]`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs ${message.isOutgoing 
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'} mt-1`}
                          >
                            {message.time}
                          </p>
                        </div>
                        {message.isOutgoing && (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>ME</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t mt-auto">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type your message..." 
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default MessagesPage;
