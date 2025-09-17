import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    } else {
      toast.error('Please select a valid PDF file');
    }
    setIsDragActive(false);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative p-12 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary bg-primary/5 shadow-medium' 
            : isDragReject
            ? 'border-destructive bg-destructive/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-colors
            ${isDragActive 
              ? 'bg-primary text-primary-foreground' 
              : isDragReject
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-muted text-muted-foreground'
            }
          `}>
            {isDragReject ? (
              <AlertCircle className="w-10 h-10" />
            ) : isDragActive ? (
              <FileText className="w-10 h-10" />
            ) : (
              <Upload className="w-10 h-10" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {isDragActive 
                ? "Drop your PDF here" 
                : isDragReject
                ? "Invalid file type"
                : "Upload PDF Document"
              }
            </h3>
            <p className="text-muted-foreground">
              {isDragReject 
                ? "Please select a PDF file (.pdf)" 
                : "Drag and drop your PDF file here, or click to browse"
              }
            </p>
          </div>

          {!isDragActive && !isDragReject && (
            <Button variant="outline" size="lg" className="mt-4">
              <Upload className="w-4 h-4 mr-2" />
              Choose PDF File
            </Button>
          )}
        </div>

        {/* Features highlight */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary text-sm font-semibold">1</span>
              </div>
              <p className="text-sm text-muted-foreground">Upload PDF</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary text-sm font-semibold">2</span>
              </div>
              <p className="text-sm text-muted-foreground">Add Annotations</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary text-sm font-semibold">3</span>
              </div>
              <p className="text-sm text-muted-foreground">Save & Export</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};