
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Case, CasePriority, CaseStatus, CaseType } from "@/types/case";
import { caseTypes, getRecentCases, priorities, statuses } from "@/data/mockCases";
import { Calendar, Filter, PlusCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface CasesListProps {
  cases?: Case[];
  showCreateButton?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  title?: string;
  description?: string;
}

const CasesList = ({ 
  cases, 
  showCreateButton = true, 
  showFilters = true,
  showPagination = true,
  title = "All Cases",
  description
}: CasesListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  
  const [allCases, setAllCases] = useState<Case[]>(() => {
    const savedCases = localStorage.getItem('caseGuardianCases');
    if (savedCases) {
      return JSON.parse(savedCases);
    }
    return cases || getRecentCases(20);
  });
  
  useEffect(() => {
    if (cases) {
      setAllCases(cases);
      localStorage.setItem('caseGuardianCases', JSON.stringify(cases));
    }
  }, [cases]);
  
  const filteredCases = allCases.filter(caseItem => {
    const matchesSearch = 
      searchTerm === "" ||
      caseItem.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "" || caseItem.caseType === filterType;
    const matchesPriority = filterPriority === "" || caseItem.priority === filterPriority;
    const matchesStatus = filterStatus === "" || caseItem.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate) {
      const caseDate = new Date(caseItem.incidentDate);
      matchesDate = 
        caseDate.getFullYear() === filterDate.getFullYear() && 
        caseDate.getMonth() === filterDate.getMonth() && 
        caseDate.getDate() === filterDate.getDate();
    }
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus && matchesDate;
  });
  
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const resetFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setFilterPriority("");
    setFilterStatus("");
    setFilterDate(undefined);
    
    toast({
      title: "Filters reset",
      description: "All filters have been cleared.",
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const renderPriorityBadge = (priority: CasePriority) => {
    switch (priority) {
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  const renderStatusBadge = (status: CaseStatus) => {
    switch(status) {
      case "new":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>;
      case "inprogress":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showCreateButton && (
            <Button onClick={() => navigate('/cases/new')} className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Case
            </Button>
          )}
        </div>
        
        {showFilters && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-1 relative items-center">
                <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search cases..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-10 w-10"
                  onClick={resetFilters}
                  title="Reset filters"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant={filterDate ? "default" : "outline"}
                      size="icon"
                      className="h-10 w-10"
                      title="Filter by date"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-2 flex flex-col space-y-2">
                      <h4 className="font-medium">Filter by date</h4>
                      <CalendarComponent
                        mode="single"
                        selected={filterDate}
                        onSelect={setFilterDate}
                        initialFocus
                      />
                      {filterDate && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setFilterDate(undefined)}
                        >
                          Clear Date
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select 
                value={filterType} 
                onValueChange={setFilterType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  {caseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={filterPriority} 
                onValueChange={setFilterPriority}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-priorities">All Priorities</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={filterStatus} 
                onValueChange={setFilterStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'inprogress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {filterDate && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex gap-1 items-center">
                  Date: {format(filterDate, "PPP")}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => setFilterDate(undefined)}
                  >
                    <span>×</span>
                  </Button>
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No cases found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCases.map((caseItem) => (
                  <TableRow 
                    key={caseItem.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/cases/${caseItem.id}`)}
                  >
                    <TableCell className="font-medium">{caseItem.caseId}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {caseItem.caseType.charAt(0).toUpperCase() + caseItem.caseType.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{caseItem.description}</TableCell>
                    <TableCell>{formatDate(caseItem.incidentDate)}</TableCell>
                    <TableCell>{renderPriorityBadge(caseItem.priority)}</TableCell>
                    <TableCell>{renderStatusBadge(caseItem.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/cases/${caseItem.id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {showPagination && filteredCases.length > 0 && totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CasesList;
