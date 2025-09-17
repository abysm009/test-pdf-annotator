import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Line, Polygon, Circle, util as fabricUtil } from "fabric";
import { AnnotationTool } from "./PDFAnnotationApp";

interface AnnotationCanvasProps {
  width: number;
  height: number;
  activeTool: AnnotationTool;
  annotations: any[];
  onAnnotationChange: (annotations: any[]) => void;
  scale: number;
  page: number;
}

export const AnnotationCanvas = ({
  width,
  height,
  activeTool,
  annotations,
  onAnnotationChange,
  scale,
  page
}: AnnotationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedObjects, setSelectedObjects] = useState<any[]>([]);
  const [showMergeButton, setShowMergeButton] = useState(false);
  const currentObjectRef = useRef<any>(null);
  const polygonPointsRef = useRef<{ x: number; y: number }[]>([]);
  const polygonPreviewRef = useRef<Polygon | null>(null);
  const polygonPointMarkersRef = useRef<Circle[]>([]);
  const polygonLinesRef = useRef<Line[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      renderOnAddRemove: false,
      selectionColor: 'rgba(0, 0, 0, 0.1)',
      selectionBorderColor: '#000000',
      selectionLineWidth: 2,
      borderColor: '#000000',
      cornerColor: '#000000',
      cornerSize: 8,
      cornerStyle: 'rect',
      borderOpacityWhenMoving: 0.8,
      cornerStrokeColor: '#ffffff',
      selectionFullyContained: false,
    });

    fabricCanvasRef.current = canvas;

    const handleObjectModified = () => {
      setTimeout(() => saveAnnotations(), 50);
    };

    const handleSelectionCreated = (e: any) => {
      updateSelection(e.selected);
    };

    const handleSelectionUpdated = (e: any) => {
      updateSelection(e.selected);
    };

    const handleSelectionCleared = () => {
      setSelectedObjects([]);
      setShowMergeButton(false);
    };

    const updateSelection = (selected: any[]) => {
      console.log('Selection updated:', selected?.length || 0, 'objects selected');
      setSelectedObjects(selected || []);
      setShowMergeButton((selected || []).length > 1);
    };

    canvas.on('object:modified', handleObjectModified);
    //canvas.on('object:scaled', handleObjectModified);
    //canvas.on('object:rotated', handleObjectModified);
    //canvas.on('object:moved', handleObjectModified);
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      canvas.off('object:modified', handleObjectModified);
      //canvas.off('object:scaled', handleObjectModified);
      //canvas.off('object:rotated', handleObjectModified);
      //canvas.off('object:moved', handleObjectModified);
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('selection:cleared', handleSelectionCleared);
      canvas.dispose();
    };
  }, []);

  // Handle canvas dimensions and scaling
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.setDimensions({ width, height });
    
    // Use CSS transform on the canvas element itself for scaling
    if (canvasRef.current) {
      canvasRef.current.style.transform = `scale(1)`;
      canvasRef.current.style.transformOrigin = '0 0';
    }
    
    canvas.renderAll();
  }, [width, height, scale]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    canvas.isDrawingMode = false;
    
    if (activeTool.type === 'hand') {
      canvas.selection = false;
      canvas.getObjects().forEach(obj => {
        obj.selectable = false;
        obj.evented = false;
      });
    } else {
      canvas.selection = activeTool.type === 'select';
      canvas.getObjects().forEach(obj => {
        obj.selectable = activeTool.type === 'select';
        obj.evented = activeTool.type === 'select';
      });
    }

    if (activeTool.type === 'select') {
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
      canvas.moveCursor = 'move';
    } else if (activeTool.type === 'hand') {
      canvas.defaultCursor = 'grab';
      canvas.hoverCursor = 'grab';
      canvas.moveCursor = 'grab';
    } else {
      canvas.defaultCursor = 'crosshair';
      canvas.hoverCursor = 'crosshair';
      canvas.moveCursor = 'crosshair';
    }

    if (activeTool.type !== 'polygon') {
      cleanupPolygon();
    }

    canvas.renderAll();
  }, [activeTool]);

  const saveAnnotations = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();

    const permanentObjects = objects.filter(obj =>
      !(obj as any).isPolygonMarker &&
      !(obj as any).isPolygonPreview &&
      !(obj as any).isPolygonLine
    );

    const annotationData = permanentObjects.map((obj, index) => {
      const data = obj.toObject();
      
      // Store coordinates normalized to base scale (scale = 1.0)
      // This ensures consistency regardless of current zoom level
      data.left = (data.left || 0) / scale;
      data.top = (data.top || 0) / scale;
      
      if (obj.type === 'line') {
        const line = obj as Line;
        data.x1 = (line.x1 || 0) / scale;
        data.y1 = (line.y1 || 0) / scale;
        data.x2 = (line.x2 || 0) / scale;
        data.y2 = (line.y2 || 0) / scale;
      }
      
      if (obj.type === 'polygon' && data.points) {
        data.points = data.points.map((point: any) => ({
          x: point.x / scale,
          y: point.y / scale
        }));
      }
      
      if (data.strokeWidth) {
        data.strokeWidth = (data.strokeWidth || 0) / scale;
      }

      return {
        id: `${page}-${index}`,
        type: obj.type,
        data,
        page
      };
    });

    onAnnotationChange(annotationData);
  }, [page, onAnnotationChange, scale]);

  const cleanupPolygon = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    if (polygonPreviewRef.current) {
      canvas.remove(polygonPreviewRef.current);
      polygonPreviewRef.current = null;
    }

    polygonLinesRef.current.forEach(line => canvas.remove(line));
    polygonLinesRef.current = [];

    polygonPointMarkersRef.current.forEach(marker => canvas.remove(marker));
    polygonPointMarkersRef.current = [];

    polygonPointsRef.current = [];

    canvas.renderAll();
  }, []);

  const updatePolygonPreview = useCallback(() => {
    if (!fabricCanvasRef.current || polygonPointsRef.current.length < 3) return;

    const canvas = fabricCanvasRef.current;

    if (polygonPreviewRef.current) {
      canvas.remove(polygonPreviewRef.current);
    }

    const preview = new Polygon(polygonPointsRef.current, {
      fill: 'transparent',
      stroke: activeTool.color,
      strokeWidth: activeTool.strokeWidth * scale,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      opacity: 0.7
    });

    (preview as any).isPolygonPreview = true;
    polygonPreviewRef.current = preview;
    canvas.add(preview);
    canvas.renderAll();
  }, [activeTool.color, activeTool.strokeWidth, scale]);

  const handlePolygonClick = useCallback((pointer: { x: number; y: number }) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const currentPoints = [...polygonPointsRef.current];

    polygonPointsRef.current.push({ x: pointer.x, y: pointer.y });

    const marker = new Circle({
      left: pointer.x,
      top: pointer.y,
      radius: 3 * scale,
      fill: activeTool.color,
      stroke: '#ffffff',
      strokeWidth: 2 * scale,
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center'
    });

    (marker as any).isPolygonMarker = true;
    polygonPointMarkersRef.current.push(marker);
    canvas.add(marker);

    if (currentPoints.length > 0) {
      const prevPoint = currentPoints[currentPoints.length - 1];
      const line = new Line([prevPoint.x, prevPoint.y, pointer.x, pointer.y], {
        stroke: activeTool.color,
        strokeWidth: activeTool.strokeWidth * scale,
        selectable: false,
        evented: false,
        strokeLineCap: 'round'
      });

      (line as any).isPolygonLine = true;
      polygonLinesRef.current.push(line);
      canvas.add(line);
    }

    if (polygonPointsRef.current.length >= 3) {
      updatePolygonPreview();
    }

    canvas.renderAll();
  }, [activeTool, scale, updatePolygonPreview]);

  const mergeSelectedObjects = useCallback(() => {
    if (!fabricCanvasRef.current || selectedObjects.length < 2) return;

    const canvas = fabricCanvasRef.current;
    
    const allPoints: { x: number; y: number }[] = [];
    
    selectedObjects.forEach(obj => {
      if (obj.type === 'line') {
        const line = obj as Line;
        const matrix = obj.calcTransformMatrix();
        const point1 = fabricUtil.transformPoint({ x: line.x1 || 0, y: line.y1 || 0 }, matrix);
        const point2 = fabricUtil.transformPoint({ x: line.x2 || 0, y: line.y2 || 0 }, matrix);
        allPoints.push(point1, point2);
      } else if (obj.type === 'polygon') {
        const polygon = obj as Polygon;
        if (polygon.points) {
          const matrix = obj.calcTransformMatrix();
          polygon.points.forEach(point => {
            const transformedPoint = fabricUtil.transformPoint(point, matrix);
            allPoints.push(transformedPoint);
          });
        }
      }
    });

    if (allPoints.length < 3) return;

    selectedObjects.forEach(obj => canvas.remove(obj));

    const mergedPolygon = new Polygon(allPoints, {
      fill: 'transparent',
      stroke: activeTool.color,
      strokeWidth: activeTool.strokeWidth * scale,
      selectable: true,
      evented: true
    });

    canvas.add(mergedPolygon);
    mergedPolygon.setCoords();
    
    canvas.discardActiveObject();
    setSelectedObjects([]);
    setShowMergeButton(false);
    
    saveAnnotations();
    canvas.renderAll();
  }, [selectedObjects, activeTool, scale, saveAnnotations]);

  const completePolygon = useCallback(() => {
    if (!fabricCanvasRef.current || polygonPointsRef.current.length < 3) return;

    const canvas = fabricCanvasRef.current;

    const polygon = new Polygon([...polygonPointsRef.current], {
      fill: 'transparent',
      stroke: activeTool.color,
      strokeWidth: activeTool.strokeWidth * scale,
      selectable: true,
      evented: true
    });

    canvas.add(polygon);
    polygon.setCoords();
    cleanupPolygon();
    saveAnnotations();
  }, [activeTool, scale, cleanupPolygon, saveAnnotations]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    const handleMouseDown = (e: any) => {
      if (activeTool.type === 'select' || activeTool.type === 'hand') return;

      const activeObject = canvas.getActiveObject();
      if (activeObject) return;

      const pointer = canvas.getPointer(e.e);

      if (activeTool.type === 'polygon') {
        e.e.preventDefault();
        e.e.stopPropagation();
        handlePolygonClick(pointer);
        return;
      }

      e.e.preventDefault();
      e.e.stopPropagation();
      setIsDrawing(true);
      let newObject: any = null;

      switch (activeTool.type) {
        case 'line':
          newObject = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: activeTool.color,
            strokeWidth: activeTool.strokeWidth * scale,
            strokeLineCap: 'round',
            selectable: false,
            evented: false
          });
          break;
      }

      if (newObject) {
        currentObjectRef.current = newObject;
        canvas.add(newObject);
        canvas.renderAll();
      }
    };

    const handleMouseMove = (e: any) => {
      if (!isDrawing || !currentObjectRef.current || activeTool.type === 'select' || activeTool.type === 'hand') return;

      const pointer = canvas.getPointer(e.e);
      const obj = currentObjectRef.current;

      switch (activeTool.type) {
        case 'line':
          obj.set({ x2: pointer.x, y2: pointer.y });
          obj.setCoords();
          break;
      }

      canvas.renderAll();
    };

    const handleMouseUp = (e: any) => {
      if (!isDrawing || !currentObjectRef.current || activeTool.type === 'select' || activeTool.type === 'hand') return;

      currentObjectRef.current.set({
        selectable: true,
        evented: true
      });
      currentObjectRef.current.setCoords();

      saveAnnotations();
      setIsDrawing(false);
      currentObjectRef.current = null;
    };

    const handleDoubleClick = (e: any) => {
      if (activeTool.type === 'polygon' && polygonPointsRef.current.length >= 3) {
        e.e.preventDefault();
        e.e.stopPropagation();
        completePolygon();
      }
    };

    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    canvas.off('mouse:dblclick');

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:dblclick', handleDoubleClick);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:dblclick', handleDoubleClick);
    };
  }, [activeTool, isDrawing, scale, handlePolygonClick, completePolygon, saveAnnotations]);

  // Load annotations for current page
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    canvas.clear();
    cleanupPolygon();

    const pageAnnotations = annotations.filter(ann => ann.page === page);

    pageAnnotations.forEach(annotation => {
      let object: any = null;

      try {
        switch (annotation.type) {
          case 'line':
            object = new Line(
              [
                (annotation.data.x1 || 0) * scale,
                (annotation.data.y1 || 0) * scale,
                (annotation.data.x2 || 0) * scale,
                (annotation.data.y2 || 0) * scale
              ],
              {
                ...annotation.data,
                left: (annotation.data.left || 0) * scale,
                top: (annotation.data.top || 0) * scale,
                strokeWidth: (annotation.data.strokeWidth || 2) * scale,
                selectable: activeTool.type === 'select',
                evented: activeTool.type === 'select'
              }
            );
            break;

          case 'polygon':
            if (annotation.data.points && annotation.data.points.length > 0) {
              const scaledPoints = annotation.data.points.map((point: any) => ({
                x: point.x * scale,
                y: point.y * scale
              }));
              
              object = new Polygon(scaledPoints, {
                ...annotation.data,
                left: (annotation.data.left || 0) * scale,
                top: (annotation.data.top || 0) * scale,
                strokeWidth: (annotation.data.strokeWidth || 2) * scale,
                selectable: activeTool.type === 'select',
                evented: activeTool.type === 'select'
              });
            }
            break;
        }

        if (object) {
          canvas.add(object);
          object.setCoords();
        }
      } catch (error) {
        console.warn('Failed to load annotation:', error, annotation);
      }
    });

    canvas.renderAll();
  }, [annotations, page, activeTool.type, scale, cleanupPolygon]);

  useEffect(() => {
    return () => {
      if (polygonPointsRef.current.length > 0) {
        cleanupPolygon();
      }
    };
  }, [page, cleanupPolygon]);

  return (
    <div
      className="absolute inset-0"
      style={{
        zIndex: 20,
        pointerEvents: activeTool.type === 'hand' ? 'none' : 'auto',
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          zIndex: 21,
          cursor: activeTool.type === 'select' ? 'default' : 'crosshair'
        }}
      />

      {activeTool.type === 'polygon' && (
        <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded text-sm pointer-events-none z-30">
          {polygonPointsRef.current.length === 0
            ? 'Click to add points'
            : polygonPointsRef.current.length < 3
              ? `Points: ${polygonPointsRef.current.length} (need 3 minimum)`
              : `Points: ${polygonPointsRef.current.length} | Double-click to complete`}
        </div>
      )}

      {showMergeButton && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={mergeSelectedObjects}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-lg text-sm font-medium transition-colors pointer-events-auto"
          >
            Merge {selectedObjects.length} objects
          </button>
        </div>
      )}

    </div>
  );
};