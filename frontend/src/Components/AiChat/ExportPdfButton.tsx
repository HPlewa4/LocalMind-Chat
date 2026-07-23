import { Download } from "lucide-react";
import { useToast } from '../../contexts/ToastContext';
import React from "react";
import { ExportPdfButtonProps } from "../../types/AiChat";

const ExportPdfButton: React.FC<ExportPdfButtonProps> = ({
  currentSessionId,
  currentSessionTitle,
  sessions
}: ExportPdfButtonProps) => {
    const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Helper function to sanitize filename
  const sanitizeFilename = (title: string): string => {
    const sanitized = title
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, '_')
      .trim();
    
    return sanitized || 'chat-export';
  };

  // async function to handle the PDF export process
  const handleExport = async () => {
    try {
      const res = await fetch(`http://localhost:8000/export-pdf/${currentSessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        if (res.status === 404) {
          console.error("Session not found or no messages available");
          showError("Session not found or no messages available for export");
          return;
        }
        console.error(`Failed to export PDF: HTTP ${res.status}`);
        showError("Failed to export PDF. Please try again.");
        return;
      }

      const blob = await res.blob();
      
      // Try to extract filename from Content-Disposition header first
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = 'chat-export.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else {
        // Fallback: use the current session title if Content-Disposition is not accessible
        const session = sessions.find((item) => item.session_id === currentSessionId);
        const sessionTitle = session?.title;
        if (sessionTitle) {
          filename = `${sanitizeFilename(sessionTitle)}.pdf`;
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error exporting PDF:", error);
      showError(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <button 
      className='text-gray-400 hover:text-white p-1 rounded'
      onClick={handleExport}
      title="Export chat as PDF"
    >
      <Download size={14}/>
    </button>
  );
};

export default ExportPdfButton;