import { useState, useCallback } from "react";
import { FileUpload } from "./FileUpload";
import { AnnotationToolbar } from "./AnnotationToolbar";
import { toast } from "sonner";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./PDFViewer").then(mod => mod.PDFViewer), {
  ssr: false,
});

export interface AnnotationTool {
  id: string;
  name: string;
  type: "select" | "hand" | "line" | "polygon";
  color: string;
  strokeWidth: number;
}

export interface PDFFile {
  file: File;
  url: string;
  name: string;
}

const PDFAnnotationApp = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [activeTool, setActiveTool] = useState<AnnotationTool>({
    id: "select",
    name: "Select",
    type: "select",
    color: "#3b82f6",
    strokeWidth: 2,
  });
  const [annotations, setAnnotations] = useState<any[]>([]);

  const handleFileUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPdfFile({
      file,
      url,
      name: file.name,
    });
    toast.success(`PDF loaded: ${file.name}`);
  }, []);

  const handleToolChange = useCallback((tool: AnnotationTool) => {
    setActiveTool(tool);
  }, []);

  const handleAnnotationChange = useCallback((newAnnotations: any[]) => {
    setAnnotations(newAnnotations);
  }, []);

  const handleSaveAnnotations = useCallback(() => {
    if (!pdfFile) return;

    // This will be handled by the PDFViewer component
    // which has access to the canvas and PDF rendering context
    const event = new CustomEvent('save-annotated-pdf', {
      detail: { annotations, fileName: pdfFile.name }
    });
    window.dispatchEvent(event);
  }, [pdfFile, annotations]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen w-screen">
        {/* Sidebar with tools */}
        <div className="fixed left-0 top-0 h-screen w-20 bg-card border-r border-border shadow-soft z-50">
          <AnnotationToolbar
            activeTool={activeTool}
            onToolChange={handleToolChange}
            onSave={handleSaveAnnotations}
            disabled={!pdfFile}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col ml-20  w-[calc(100vw-5rem)] overflow-hidden">
          {!pdfFile ? (
            <div className="flex-1 flex items-center justify-center p-8 ">
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col ">
              {/* PDF Header */}
              <div className="sticky top-0 z-20 h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-soft">
                <div className="flex items-center gap-4">
                  <h1 className="text-lg font-semibold text-foreground">
                    {pdfFile.name}
                  </h1>
                  <div className="text-sm text-muted-foreground">
                    {annotations.length} annotation
                    {annotations.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Tool: {activeTool.name}
                  </span>
                  <div
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: activeTool.color }}
                  />
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 bg-pdf-background ">
                <PDFViewer
                  pdfFile={pdfFile}
                  activeTool={activeTool}
                  annotations={annotations}
                  onAnnotationChange={handleAnnotationChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFAnnotationApp;