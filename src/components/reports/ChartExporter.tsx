
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadFile } from "@/utils/fileDownloader";
import { useToast } from "@/hooks/use-toast";

interface ChartExporterProps {
  chartName: string;
  data: any;
  format?: "json" | "csv" | "xlsx" | "pdf";
  variant?: "outline" | "default";
  size?: "sm" | "default";
}

/**
 * A reusable component for exporting chart data
 */
const ChartExporter = ({ 
  chartName, 
  data, 
  format = "json", 
  variant = "outline", 
  size = "sm" 
}: ChartExporterProps) => {
  const { toast } = useToast();
  
  const handleExport = () => {
    // Ensure data is in the correct format
    const exportData = Array.isArray(data) ? [...data] : 
                      typeof data === 'object' ? {...data} : data;
    
    // Use the file downloader utility
    const success = downloadFile(exportData, `Chart-${chartName}`, format.toLowerCase());
    
    if (success) {
      toast({
        title: "Chart Exported",
        description: `${chartName} chart has been exported as a ${format.toUpperCase()} file.`,
      });
    } else {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your chart. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Export Chart
    </Button>
  );
};

export default ChartExporter;
