
/**
 * Utility for downloading files in different formats
 */

/**
 * Download data as a file with the specified filename and format
 * @param data Data to be downloaded (object, array, or primitive)
 * @param filename Name of the file (without extension)
 * @param fileType File type/extension (csv, json, xlsx, pdf)
 * @returns Boolean indicating success or failure
 */
export const downloadFile = (data: any, filename: string, fileType: string): boolean => {
  let content = '';
  let mimeType = '';
  let extension = '';
  
  // Process content based on file type
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
    // For demo purposes, we'll just use JSON for XLSX
    mimeType = 'application/octet-stream';
    extension = '.xlsx';
    content = JSON.stringify(data, null, 2);
  } else if (fileType === 'pdf') {
    // For demo purposes, we'll create a simple text representation
    // and set the correct MIME type for PDF
    mimeType = 'application/pdf';
    extension = '.pdf';
    
    if (typeof data === 'object') {
      content = JSON.stringify(data, null, 2);
    } else {
      content = String(data);
    }
  } else {
    // Default to text for unknown types
    mimeType = 'text/plain;charset=utf-8;';
    extension = '.txt';
    
    if (typeof data === 'object') {
      content = JSON.stringify(data, null, 2);
    } else {
      content = String(data);
    }
  }
  
  // Create and trigger download
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and set properties for download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + extension;
    link.style.display = 'none';
    
    // Add to DOM, click and cleanup
    document.body.appendChild(link);
    link.click();
    
    // Small timeout before cleanup to ensure download starts
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
