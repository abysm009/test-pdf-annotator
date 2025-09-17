import PDFAnnotationApp from "@/components/PDFAnnotationApp";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export default function Home() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PDFAnnotationApp />
    </TooltipProvider>
  );
}
