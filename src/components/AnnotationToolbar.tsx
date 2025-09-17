import { 
  MousePointer, 
  Hand,
  Minus,
  Hexagon,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnnotationTool } from "./PDFAnnotationApp";

interface AnnotationToolbarProps {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  onSave: () => void;
  disabled?: boolean;
}

export const AnnotationToolbar = ({ 
  activeTool, 
  onToolChange, 
  onSave, 
  disabled = false 
}: AnnotationToolbarProps) => {
  
  const tools = [
    {
      id: 'select',
      name: 'Select',
      type: 'select' as const,
      icon: MousePointer,
      tooltip: 'Select and move annotations'
    },
    {
      id: 'hand',
      name: 'Hand',
      type: 'hand' as const,
      icon: Hand,
      tooltip: 'Pan and drag the document'
    },
    {
      id: 'line',
      name: 'Line',
      type: 'line' as const,
      icon: Minus,
      tooltip: 'Draw lines'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      type: 'polygon' as const,
      icon: Hexagon,
      tooltip: 'Draw custom polygons'
    }
  ];

  const colors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#22c55e', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#000000'  // Black
  ];

  const handleToolClick = (tool: typeof tools[0]) => {
    onToolChange({
      id: tool.id,
      name: tool.name,
      type: tool.type,
      color: activeTool.color,
      strokeWidth: activeTool.strokeWidth
    });
  };

  const handleColorChange = (color: string) => {
    onToolChange({
      ...activeTool,
      color
    });
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Tools */}
      <div className="flex flex-col p-2 space-y-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool.type === tool.type;
          
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleToolClick(tool)}
                  disabled={disabled}
                  className={`
                    w-14 h-14 p-0 transition-all duration-200
                    ${isActive 
                      ? 'bg-tool-active text-white shadow-medium' 
                      : 'hover:bg-tool-hover hover:text-tool-active'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tool.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <Separator className="mx-2" />

      {/* Color Palette */}
      <div className="flex flex-col p-2">
        <div className="text-xs text-muted-foreground mb-2 px-1">Colors</div>
        <div className="grid grid-cols-2 gap-1">
          {colors.map((color) => (
            <Tooltip key={color}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleColorChange(color)}
                  disabled={disabled}
                  className={`
                    w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110
                    ${activeTool.color === color 
                      ? 'border-primary shadow-medium' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  style={{ backgroundColor: color }}
                />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{color}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <Separator className="mx-2" />

      {/* Actions */}
      <div className="flex flex-col p-2 space-y-1 mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              disabled={disabled}
              className="w-14 h-14 p-0 hover:bg-accent hover:text-accent-foreground"
            >
              <Download className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Save annotated PDF</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};