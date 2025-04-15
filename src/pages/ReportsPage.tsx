import { useState } from "react";
import AppShell from "@/components/layouts/AppShell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, FileText, PieChart, FilePlus, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from "recharts";
import { getRecentCases } from "@/data/mockCases";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const ReportsPage = () => {
  const { toast } = useToast();
  const [reportName, setReportName] = useState("");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [reportType, setReportType] = useState("summary");
  const [dateRange, setDateRange] = useState("last30days");
  
  const cases = getRecentCases(30);
  
  const caseTypeData = cases.reduce((acc, caseItem) => {
    const existingType = acc.find(item => item.name === caseItem.caseType);
    if (existingType) {
      existingType.value += 1;
    } else {
      acc.push({ name: caseItem.caseType, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);
  
  const statusData = cases.reduce((acc, caseItem) => {
    const existingStatus = acc.find(item => item.name === caseItem.status);
    if (existingStatus) {
      existingStatus.value += 1;
    } else {
      acc.push({ name: caseItem.status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);
  
  const priorityData = [
    { name: "Low", value: cases.filter(c => c.priority === "low").length },
    { name: "Medium", value: cases.filter(c => c.priority === "medium").length },
    { name: "High", value: cases.filter(c => c.priority === "high").length },
  ];
  
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthName = month.toLocaleString('default', { month: 'short' });
    
    return {
      name: monthName,
      value: Math.floor(Math.random() * 20) + 5,
    };
  }).reverse();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  const downloadFile = (data: any, filename: string, fileType: string) => {
    let content = '';
    let mimeType = '';
    let extension = '';
    
    if (fileType === 'csv') {
      mimeType = 'text/csv;charset=utf-8;';
      extension = '.csv';
      
      if (Array.isArray(data)) {
        if (data.length > 0 && typeof data[0] === 'object') {
          const headers = Object.keys(data[0]).join(',');
          const rows = data.map(item => 
            Object.values(item).map(value => 
              typeof value === 'string' ? `"${value}"` : value
            ).join(',')
          );
          content = [headers, ...rows].join('\n');
        } else {
          content = data.join('\n');
        }
      } else if (typeof data === 'object') {
        content = Object.entries(data).map(([key, value]) => `${key},${value}`).join('\n');
      } else {
        content = String(data);
      }
    } else if (fileType === 'json') {
      mimeType = 'application/json;charset=utf-8;';
      extension = '.json';
      content = JSON.stringify(data, null, 2);
    } else if (fileType === 'xlsx') {
      mimeType = 'application/json;charset=utf-8;';
      extension = '.xlsx';
      content = JSON.stringify(data, null, 2);
    } else {
      mimeType = 'text/plain;charset=utf-8;';
      extension = '.pdf';
      
      if (typeof data === 'object') {
        content = JSON.stringify(data, null, 2);
      } else {
        content = String(data);
      }
    }
    
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename + extension;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (error) {
      console.error("Error creating download:", error);
      return false;
    }
  };
  
  const handleExportReport = () => {
    const exportData = {
      caseTypes: caseTypeData,
      caseStatus: statusData,
      priorityDistribution: priorityData,
      monthlyTrends: monthlyData
    };
    
    const success = downloadFile(exportData, "CaseGuardian-Reports", reportFormat.toLowerCase());
    
    if (success) {
      toast({
        title: "Report Exported",
        description: `Your report has been exported as a ${reportFormat.toUpperCase()} file.`,
      });
    } else {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your report. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleGenerateReport = () => {
    if (!reportName.trim()) {
      toast({
        title: "Report Name Required",
        description: "Please enter a name for your report.",
        variant: "destructive"
      });
      return;
    }
    
    let reportData;
    if (reportType === "summary") {
      reportData = {
        reportName,
        dateGenerated: new Date().toISOString(),
        dateRange,
        totalCases: cases.length,
        openCases: cases.filter(c => c.status === "new" || c.status === "inprogress").length,
        closedCases: cases.filter(c => c.status === "resolved").length,
        highPriorityCases: cases.filter(c => c.priority === "high").length,
        averageResolutionDays: 4.2,
        summaryByType: caseTypeData,
      };
    } else if (reportType === "detailed") {
      reportData = {
        reportName,
        dateGenerated: new Date().toISOString(),
        dateRange,
        cases: cases.map(c => ({
          id: c.id,
          caseId: c.caseId,
          description: c.description,
          status: c.status,
          priority: c.priority,
          caseType: c.caseType,
          createdAt: c.createdAt,
          location: c.location
        }))
      };
    } else {
      reportData = {
        reportName,
        dateGenerated: new Date().toISOString(),
        dateRange,
        statistics: {
          caseTypeDistribution: caseTypeData,
          statusDistribution: statusData,
          priorityDistribution: priorityData,
          monthlyTrends: monthlyData,
          resolutionTime: {
            average: 4.2,
            median: 3.8,
            byPriority: {
              high: 2.1,
              medium: 4.5,
              low: 5.9
            }
          }
        }
      };
    }
    
    downloadFile(reportData, reportName, reportFormat.toLowerCase());
    
    toast({
      title: "Report Generated",
      description: `Your ${reportType} report "${reportName}" has been generated.`,
    });
  };
  
  const handleChartExport = (chartName: string, data: any) => {
    downloadFile(data, `Chart-${chartName}`, reportFormat.toLowerCase());
    
    toast({
      title: "Chart Exported",
      description: `${chartName} chart has been exported.`,
    });
  };
  
  const handleAnalyticsExport = () => {
    const analyticsData = {
      time: new Date().toISOString(),
      caseResolutionTime: 4.2,
      caseVolume: 143,
      clearanceRate: 97,
      trends: [
        { name: 'Jan', cases: 65, clearance: 81 },
        { name: 'Feb', cases: 75, clearance: 73 },
        { name: 'Mar', cases: 85, clearance: 78 },
        { name: 'Apr', cases: 95, clearance: 92 },
        { name: 'May', cases: 85, clearance: 87 },
        { name: 'Jun', cases: 75, clearance: 76 },
      ],
      predictions: {
        nextMonth: 152,
        resolutionTime: 3.9,
        highPriorityPercentage: 18
      }
    };
    
    downloadFile(analyticsData, "Analytics-Report", reportFormat.toLowerCase());
    
    toast({
      title: "Analytics Data Exported",
      description: "Your analytics data has been exported successfully.",
    });
  };
  
  const handleRecentReportDownload = (reportName: string) => {
    const recentReportData = {
      reportName,
      generatedOn: new Date().toISOString(),
      author: "Current User",
      summary: "This is a sample recent report that was previously generated.",
      caseData: cases.slice(0, 10)
    };
    
    const format = reportName.includes("XLSX") ? "xlsx" : "pdf";
    downloadFile(recentReportData, reportName, format);
    
    toast({
      title: "Previous Report Downloaded",
      description: `Report "${reportName}" has been downloaded.`,
    });
  };
  
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground mt-2">
              Analyze case data and generate insights
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="self-start flex items-center gap-2"
            onClick={handleExportReport}
          >
            <Download className="h-4 w-4" />
            Export Reports
          </Button>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="py-2">
              <BarChart3 className="h-4 w-4 mr-2 md:inline hidden" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="cases" className="py-2">
              <FileText className="h-4 w-4 mr-2 md:inline hidden" />
              Case Reports
            </TabsTrigger>
            <TabsTrigger value="analytics" className="py-2">
              <PieChart className="h-4 w-4 mr-2 md:inline hidden" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Case Types Distribution</CardTitle>
                  <CardDescription>Breakdown of cases by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Pie
                          data={caseTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {caseTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </RPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleChartExport("CaseTypesDistribution", caseTypeData)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Chart
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Case Volume</CardTitle>
                  <CardDescription>Number of cases over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleChartExport("MonthlyCaseVolume", monthlyData)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Chart
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Case Priority Distribution</CardTitle>
                  <CardDescription>Breakdown of cases by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleChartExport("CasePriorityDistribution", priorityData)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Chart
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Breakdown of cases by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </RPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleChartExport("StatusDistribution", statusData)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Chart
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="cases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Case Reports</CardTitle>
                <CardDescription>Generate detailed case reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Name</label>
                    <Input 
                      placeholder="Enter report name" 
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Format</label>
                    <Select
                      value={reportFormat}
                      onValueChange={setReportFormat}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select
                      value={reportType}
                      onValueChange={setReportType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary Report</SelectItem>
                        <SelectItem value="detailed">Detailed Report</SelectItem>
                        <SelectItem value="statistics">Statistical Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <Select
                      value={dateRange}
                      onValueChange={setDateRange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last7days">Last 7 Days</SelectItem>
                        <SelectItem value="last30days">Last 30 Days</SelectItem>
                        <SelectItem value="last90days">Last 90 Days</SelectItem>
                        <SelectItem value="thisyear">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {dateRange === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input type="date" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input type="date" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Include Fields</label>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Case ID
                      </Button>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Description
                      </Button>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Status
                      </Button>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Priority
                      </Button>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Location
                      </Button>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Dates
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filter Cases</label>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        All Cases
                      </Button>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Open Cases
                      </Button>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Closed Cases
                      </Button>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        High Priority
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="flex items-center">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
                <Button onClick={handleGenerateReport} className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Your recently generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Report Name</th>
                        <th className="p-3 text-left font-medium">Generated On</th>
                        <th className="p-3 text-left font-medium">Format</th>
                        <th className="p-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">March Cases Summary</td>
                        <td className="p-3">Apr 8, 2025</td>
                        <td className="p-3">PDF</td>
                        <td className="p-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => handleRecentReportDownload("March Cases Summary")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Q1 Statistical Report</td>
                        <td className="p-3">Apr 5, 2025</td>
                        <td className="p-3">XLSX</td>
                        <td className="p-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => handleRecentReportDownload("Q1 Statistical Report XLSX")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3">High Priority Cases</td>
                        <td className="p-3">Mar 29, 2025</td>
                        <td className="p-3">PDF</td>
                        <td className="p-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => handleRecentReportDownload("High Priority Cases")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Gain deeper insights into your case data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Case Resolution Time</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 pb-4">
                      <div className="text-3xl font-bold">4.2 days</div>
                      <p className="text-sm text-muted-foreground">Average time to resolution</p>
                      <div className="text-sm text-green-500 mt-2">↓ 12% from last month</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Case Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 pb-4">
                      <div className="text-3xl font-bold">143</div>
                      <p className="text-sm text-muted-foreground">Total cases this month</p>
                      <div className="text-sm text-red-500 mt-2">↑ 8% from last month</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Clearance Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 pb-4">
                      <div className="text-3xl font-bold">97%</div>
                      <p className="text-sm text-muted-foreground">Cases cleared vs. new cases</p>
                      <div className="text-sm text-green-500 mt-2">↑ 5% from last month</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Trend Analysis</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAnalyticsExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Jan', cases: 65, clearance: 81 },
                          { name: 'Feb', cases: 75, clearance: 73 },
                          { name: 'Mar', cases: 85, clearance: 78 },
                          { name: 'Apr', cases: 95, clearance: 92 },
                          { name: 'May', cases: 85, clearance: 87 },
                          { name: 'Jun', cases: 75, clearance: 76 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="cases" fill="#8884d8" name="New Cases" />
                        <Bar dataKey="clearance" fill="#82ca9d" name="Cleared Cases" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Predictive Analytics</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const predictionData = {
                        nextMonthVolume: 152,
                        resolutionTime: 3.9,
                        highPriorityPercent: 18
                      };
                      downloadFile(predictionData, "Case-Predictions", reportFormat.toLowerCase());
                      
                      toast({
                        title: "Prediction Generated",
                        description: "Case volume prediction for next month generated.",
                      });
                    }}
                  >
                    Run Prediction
                  </Button>
                </div>
                
                <div className="rounded-md border p-4">
                  <p className="mb-4">Based on historical data analysis, we predict:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                      <span>Expected case volume next month: <strong>152 cases</strong></span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <span>Expected resolution time: <strong>3.9 days</strong></span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
                      <span>Predicted high priority cases: <strong>18%</strong></span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleAnalyticsExport} className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default ReportsPage;
