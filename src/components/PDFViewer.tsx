import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { AnnotationCanvas } from "./AnnotationCanvas";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Columns,
  Square,
  FileText,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AnnotationTool, PDFFile } from "./PDFAnnotationApp";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

type ViewMode = "single" | "dual" | "quad" | "octo";

interface PDFViewerProps {
  pdfFile: PDFFile;
  activeTool: AnnotationTool;
  annotations: any[];
  onAnnotationChange: (annotations: any[]) => void;
}

interface PageViewport {
  width: number;
  height: number;
}

export const PDFViewer = ({
  pdfFile,
  activeTool,
  annotations,
  onAnnotationChange,
}: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [pageViewports, setPageViewports] = useState<Map<number, PageViewport>>(
    new Map()
  );
  const [viewMode, setViewMode] = useState<ViewMode>("single");

  // Pan/drag state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Get pages to display based on view mode
  const getPagesToDisplay = useCallback((): number[] => {
    switch (viewMode) {
      case "single":
        return [currentPage];
      case "dual":
        if (currentPage === numPages) {
          return [currentPage];
        }
        return [currentPage, Math.min(currentPage + 1, numPages)];
      case "quad":
        const pages = [];
        for (let i = 0; i < 4; i++) {
          const pageNum = currentPage + i;
          if (pageNum <= numPages) {
            pages.push(pageNum);
          }
        }
        return pages;
      case "octo":
        const octoPages = [];
        for (let i = 0; i < 8; i++) {
          const pageNum = currentPage + i;
          if (pageNum <= numPages) {
            octoPages.push(pageNum);
          }
        }
        return octoPages;
      default:
        return [currentPage];
    }
  }, [viewMode, currentPage, numPages]);

  // Calculate grid layout based on view mode
  const getGridLayout = (mode: ViewMode) => {
    switch (mode) {
      case "single":
        return { cols: 1, rows: 1 };
      case "dual":
        return { cols: 2, rows: 1 };
      case "quad":
        return { cols: 2, rows: 2 };
      case "octo":
        return { cols: 4, rows: 2 };
      default:
        return { cols: 1, rows: 1 };
    }
  };

  // Calculate scale for tile view
  const getTileScale = useCallback(() => {
    if (!containerRef.current || pageViewports.size === 0) return scale;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 40; // padding
    const containerHeight = container.clientHeight - 40; // padding

    const layout = getGridLayout(viewMode);
    const sampleViewport = Array.from(pageViewports.values())[0];

    if (!sampleViewport) return scale;

    // Calculate available space per tile
    const availableWidthPerTile = containerWidth / layout.cols - 20; // gap
    const availableHeightPerTile = containerHeight / layout.rows - 20; // gap

    // Calculate scale to fit
    const scaleX = availableWidthPerTile / sampleViewport.width;
    const scaleY = availableHeightPerTile / sampleViewport.height;
    const autoScale = Math.min(scaleX, scaleY, scale); // Don't exceed user scale

    return Math.max(0.1, autoScale);
  }, [scale, viewMode, pageViewports]);

  // Center the document when it loads or scale/page changes
  useEffect(() => {
    if (containerRef.current && pageViewports.size > 0) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (viewMode === "single") {
        const viewport = pageViewports.get(currentPage);
        if (viewport) {
          const scaledWidth = viewport.width * scale;
          const scaledHeight = viewport.height * scale;
          const centerX = (containerWidth - scaledWidth) / 2;
          const centerY = (containerHeight - scaledHeight) / 2;
          setPanOffset({ x: centerX, y: centerY });
        }
      } else {
        // Center tile grid
        setPanOffset({ x: 20, y: 20 });
      }
    }
  }, [scale, viewMode, currentPage, pageViewports]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool.type !== "hand") return;

      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        panX: panOffset.x,
        panY: panOffset.y,
      });
    },
    [activeTool.type, panOffset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragStart || activeTool.type !== "hand") return;

      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setPanOffset({
        x: dragStart.panX + deltaX,
        y: dragStart.panY + deltaY,
      });
    },
    [isDragging, dragStart, activeTool.type]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStart || activeTool.type !== "hand") return;

      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setPanOffset({
        x: dragStart.panX + deltaX,
        y: dragStart.panY + deltaY,
      });
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging, dragStart, activeTool.type]);

  // Save PDF with annotations (existing functionality)
  useEffect(() => {
    const handleSavePDF = async (event: CustomEvent) => {
      try {
        const { jsPDF } = await import("jspdf");

        const pdfDoc = await pdfjs.getDocument(pdfFile.url).promise;
        const firstPage = await pdfDoc.getPage(1);
        const firstPageViewport = firstPage.getViewport({ scale: 1.0 });

        const pdfWidthMM = (firstPageViewport.width * 25.4) / 72;
        const pdfHeightMM = (firstPageViewport.height * 25.4) / 72;

        const pdf = new jsPDF({
          orientation: pdfWidthMM > pdfHeightMM ? "landscape" : "portrait",
          unit: "mm",
          format: [pdfWidthMM, pdfHeightMM],
        });

        let isFirstPage = true;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          if (!isFirstPage) {
            pdf.addPage();
          }
          isFirstPage = false;

          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const pageAnnotations = annotations.filter(
            (ann) => ann.page === pageNum
          );

          pageAnnotations.forEach((annotation) => {
            const scaleRatio = 1.5;

            context.strokeStyle = annotation.data.stroke || "#3b82f6";
            context.lineWidth = (annotation.data.strokeWidth || 2) * scaleRatio;
            context.lineCap = "round";
            context.lineJoin = "round";

            context.save();

            const left = (annotation.data.left || 0) * scaleRatio;
            const top = (annotation.data.top || 0) * scaleRatio;
            const scaleX = annotation.data.scaleX || 1;
            const scaleY = annotation.data.scaleY || 1;
            const angle = ((annotation.data.angle || 0) * Math.PI) / 180;

            context.translate(left, top);
            context.rotate(angle);
            context.scale(scaleX, scaleY);

            switch (annotation.type) {
              case "line":
                context.beginPath();
                const x1 = (annotation.data.x1 || 0) * scaleRatio;
                const y1 = (annotation.data.y1 || 0) * scaleRatio;
                const x2 = (annotation.data.x2 || 0) * scaleRatio;
                const y2 = (annotation.data.y2 || 0) * scaleRatio;

                context.moveTo(x1 - left, y1 - top);
                context.lineTo(x2 - left, y2 - top);
                context.stroke();
                break;

              case "polygon":
                if (
                  annotation.data.points &&
                  annotation.data.points.length > 0
                ) {
                  context.beginPath();
                  const points = annotation.data.points;

                  context.moveTo(
                    points[0].x * scaleRatio - left,
                    points[0].y * scaleRatio - top
                  );

                  for (let i = 1; i < points.length; i++) {
                    context.lineTo(
                      points[i].x * scaleRatio - left,
                      points[i].y * scaleRatio - top
                    );
                  }

                  context.closePath();
                  context.stroke();
                }
                break;
            }

            context.restore();
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgAspectRatio = canvas.width / canvas.height;
          const pageAspectRatio = pageWidth / pageHeight;

          let imgWidth = pageWidth;
          let imgHeight = pageHeight;
          let offsetX = 0;
          let offsetY = 0;

          if (imgAspectRatio > pageAspectRatio) {
            imgHeight = pageWidth / imgAspectRatio;
            offsetY = (pageHeight - imgHeight) / 2;
          } else {
            imgWidth = pageHeight * imgAspectRatio;
            offsetX = (pageWidth - imgWidth) / 2;
          }

          pdf.addImage(imgData, "JPEG", offsetX, offsetY, imgWidth, imgHeight);
        }

        const fileName = pdfFile.name.replace(".pdf", "-annotated.pdf");
        pdf.save(fileName);
        toast.success("Annotated PDF saved successfully!");
      } catch (error) {
        console.error("Error saving PDF:", error);
        toast.error("Failed to save annotated PDF");
      }
    };

    window.addEventListener(
      "save-annotated-pdf",
      // @ts-ignore
      handleSavePDF as EventListener
    );

    return () => {
      window.removeEventListener(
        "save-annotated-pdf",
        // @ts-ignore
        handleSavePDF as EventListener
      );
    };
  }, [pdfFile, annotations, numPages]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setPageLoading(false);
      toast.success(`PDF loaded with ${numPages} pages`);
    },
    []
  );

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("Error loading PDF:", error);
    toast.error("Failed to load PDF file");
  }, []);

  const onPageLoadSuccess = useCallback((page: any, pageNum: number) => {
    const viewport = page.getViewport({ scale: 1.0 });
    setPageViewports((prev) =>
      new Map(prev).set(pageNum, {
        width: viewport.width,
        height: viewport.height,
      })
    );
  }, []);

  const handlePrevPage = useCallback(() => {
    if (viewMode === "single") {
      setCurrentPage((prev) => Math.max(1, prev - 1));
    } else {
      const layout = getGridLayout(viewMode);
      const pagesPerView = layout.cols * layout.rows;
      setCurrentPage((prev) => Math.max(1, prev - pagesPerView));
    }
  }, [viewMode]);

  const handleNextPage = useCallback(() => {
    if (viewMode === "single") {
      setCurrentPage((prev) => Math.min(numPages, prev + 1));
    } else {
      const layout = getGridLayout(viewMode);
      const pagesPerView = layout.cols * layout.rows;
      setCurrentPage((prev) =>
        Math.min(numPages - pagesPerView + 1, prev + pagesPerView)
      );
    }
  }, [numPages, viewMode]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(3.0, prev + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.25, prev - 0.25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= numPages) {
        setCurrentPage(page);
      }
    },
    [numPages]
  );

  const handleAnnotationChange = useCallback(
    (pageAnnotations: any[], pageNum: number) => {
      const otherPageAnnotations = annotations.filter(
        (ann) => ann.page !== pageNum
      );
      const updatedAnnotations = [
        ...otherPageAnnotations,
        ...pageAnnotations.map((ann) => ({ ...ann, page: pageNum })),
      ];
      onAnnotationChange(updatedAnnotations);
    },
    [annotations, onAnnotationChange]
  );

  const getCursorStyle = () => {
    if (activeTool.type === "hand") {
      return isDragging ? "grabbing" : "grab";
    }
    if (activeTool.type === "select") {
      return "default";
    }
    return "crosshair";
  };

  // View mode buttons
  const viewModeButtons = [
    { mode: "single" as ViewMode, icon: FileText, label: "Single Page" },
    { mode: "dual" as ViewMode, icon: Columns, label: "2 Pages" },
    { mode: "quad" as ViewMode, icon: Square, label: "4 Pages" },
    { mode: "octo" as ViewMode, icon: Grid, label: "8 Pages" },
  ];

  const pagesToDisplay = getPagesToDisplay();
  const tileScale = viewMode !== "single" ? getTileScale() : scale;
  const layout = getGridLayout(viewMode);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="sticky top-16 z-10 h-12 bg-card border-b border-border flex items-center justify-between px-4 shadow-soft w-[calc(100vw-5rem)]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 text-center bg-background border border-border rounded"
              min={1}
              max={numPages}
            />
            <span className="text-muted-foreground">of {numPages}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={
              viewMode === "single"
                ? currentPage >= numPages
                : currentPage + layout.cols * layout.rows - 1 >= numPages
            }
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* View Mode Controls */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1">
          {viewModeButtons.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
              title={label}
              className="h-8 px-2"
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-sm text-muted-foreground min-w-16 text-center">
            {Math.round((viewMode !== "single" ? tileScale : scale) * 100)}%
          </span>

          <Button variant="ghost" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="ghost" size="sm" onClick={handleRotate}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div
        ref={containerRef}
        className="flex-1 bg-pdf-background overflow-auto relative"
        style={{ cursor: getCursorStyle() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          className={`${viewMode === "single" ? "absolute" : "p-5"}`}
          style={
            viewMode === "single"
              ? {
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                  willChange: "transform",
                }
              : {}
          }
        >
          {viewMode === "single" ? (
            // Single page view
            <div
              className="relative bg-white shadow-strong rounded-sm"
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            >
              <Document
                file={pdfFile.url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">Loading PDF...</div>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  onLoadSuccess={(page) => onPageLoadSuccess(page, currentPage)}
                  loading={
                    <div className="flex items-center justify-center p-8 bg-white">
                      <div className="text-muted-foreground">
                        Loading page...
                      </div>
                    </div>
                  }
                  className="select-none"
                  canvasBackground="transparent"
                />
              </Document>

              {pageViewports.has(currentPage) && (
                <div
                  className="absolute inset-0"
                  style={{
                    pointerEvents: activeTool.type === "hand" ? "none" : "auto",
                  }}
                >
                  <AnnotationCanvas
                    width={pageViewports.get(currentPage)!.width * scale}
                    height={pageViewports.get(currentPage)!.height * scale}
                    activeTool={activeTool}
                    annotations={annotations.filter(
                      (ann) => ann.page === currentPage
                    )}
                    onAnnotationChange={(pageAnnotations) =>
                      handleAnnotationChange(pageAnnotations, currentPage)
                    }
                    scale={scale}
                    page={currentPage}
                  />
                </div>
              )}
            </div>
          ) : (
            // Multi-page tile view
            <div
              className={`grid gap-5`}
              style={{
                gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
              }}
            >
              {pagesToDisplay.map((pageNum) => (
                <div
                  key={pageNum}
                  className="relative bg-white shadow-strong rounded-sm overflow-hidden"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                  }}
                >
                  <Document
                    file={pdfFile.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                  >
                    <Page
                      pageNumber={pageNum}
                      scale={tileScale}
                      rotate={rotation}
                      onLoadSuccess={(page) => onPageLoadSuccess(page, pageNum)}
                      loading={
                        <div className="flex items-center justify-center p-4 bg-white text-xs">
                          <div className="text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      }
                      className="select-none"
                      canvasBackground="transparent"
                    />
                  </Document>

                  {/* Page number overlay */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs z-10">
                    {pageNum}
                  </div>

                  {pageViewports.has(pageNum) && (
                    <div
                      className="absolute inset-0"
                      style={{
                        pointerEvents:
                          activeTool.type === "hand" ? "none" : "auto",
                      }}
                    >
                      <AnnotationCanvas
                        width={pageViewports.get(pageNum)!.width * tileScale}
                        height={pageViewports.get(pageNum)!.height * tileScale}
                        activeTool={activeTool}
                        annotations={annotations.filter(
                          (ann) => ann.page === pageNum
                        )}
                        onAnnotationChange={(pageAnnotations) =>
                          handleAnnotationChange(pageAnnotations, pageNum)
                        }
                        scale={tileScale}
                        page={pageNum}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tool-specific instruction overlays */}
        {activeTool.type === "hand" && (
          <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded text-sm pointer-events-none z-30">
            Drag to pan the document
          </div>
        )}

        {activeTool.type === "select" && (
          <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded text-sm pointer-events-none z-30">
            Click annotations to select and move
          </div>
        )}
      </div>
    </div>
  );
};
