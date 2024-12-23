import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, AlertTriangle, Activity } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type InstanceStatus = "healthy" | "warning" | "critical" | "offline";
type TileSize = "small" | "medium" | "large";

interface InstanceTileProps {
  name: string;
  status: InstanceStatus;
  cpuUsage: number;
  diskIO: number;
  responseTime: number;
  alerts: number;
  events: number;
  changes: number;
  totalTime: string | number;
  executions: number;
  dbType: string;
  tags: {
    env: string;
    app: string;
    dc: string;
    customer: string;
  };
  size?: TileSize;
  onNameClick?: () => void;
  onViewDetails?: () => void;
}

const getStatusColor = (status: InstanceStatus) => {
  const colors = {
    healthy: {
      text: "text-green-500",
      border: "border-l-4 border-l-green-500",
      bg: "bg-green-500/5 dark:bg-green-500/10",
    },
    warning: {
      text: "text-yellow-500",
      border: "border-l-4 border-l-yellow-500",
      bg: "bg-yellow-500/5 dark:bg-yellow-500/10",
    },
    critical: {
      text: "text-red-500",
      border: "border-l-4 border-l-red-500",
      bg: "bg-red-500/5 dark:bg-red-500/10",
    },
    offline: {
      text: "text-gray-500",
      border: "border-l-4 border-l-gray-500",
      bg: "bg-gray-500/5 dark:bg-gray-500/10",
    },
  };
  return colors[status];
};

const InstanceTile = ({
  name,
  status,
  cpuUsage,
  diskIO,
  responseTime,
  alerts,
  events,
  changes,
  totalTime,
  executions,
  dbType,
  tags,
  size = "medium",
  onNameClick,
  onViewDetails,
}: InstanceTileProps) => {
  const statusColors = getStatusColor(status);

  if (size === "large") {
    return (
      <div
        className={`flex items-center gap-4 px-4 py-2 ${statusColors.bg} hover:bg-accent/50 cursor-pointer`}
        onClick={onViewDetails}
      >
        <div className="w-[300px] truncate">
          <Button
            variant="link"
            className="p-0 h-auto font-medium hover:no-underline"
            onClick={(e) => {
              e.stopPropagation();
              onNameClick?.();
            }}
          >
            {name}
          </Button>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={`${statusColors.text} capitalize`}
            >
              {status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {dbType}
            </Badge>
          </div>
        </div>
        <div className="w-[120px] text-center">
          {alerts > 0 && (
            <div className="flex items-center justify-center gap-1 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              {alerts}
            </div>
          )}
        </div>
        <div className="w-[120px] text-center">{changes}</div>
        <div className="w-[120px] text-center">{events}</div>
        <div className="w-[180px] text-center">{totalTime}</div>
        <div className="w-[180px] text-center">
          {executions.toLocaleString()}
        </div>
        <div className="w-[180px] text-center">{responseTime}ms</div>
        <div className="w-[100px] text-center">
          <div className="flex items-center justify-center gap-2">
            <Activity className="h-4 w-4" />
            <span>{cpuUsage}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`relative overflow-hidden ${statusColors.border} ${statusColors.bg} hover:bg-accent/50 cursor-pointer h-[${size === "small" ? "120px" : "200px"}]`}
      onClick={onViewDetails}
    >
      <div className="absolute top-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails?.()}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4">
        <div className="space-y-1">
          <Button
            variant="link"
            className="p-0 h-auto font-medium hover:no-underline"
            onClick={(e) => {
              e.stopPropagation();
              onNameClick?.();
            }}
          >
            {name}
          </Button>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${statusColors.text} capitalize`}
            >
              {status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {dbType}
            </Badge>
          </div>
        </div>

        {size === "medium" && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">CPU Usage</div>
                <div className="text-2xl font-bold">{cpuUsage}%</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Disk I/O</div>
                <div className="text-2xl font-bold">{diskIO}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Response Time</div>
              <div className="text-2xl font-bold">{responseTime}ms</div>
            </div>
          </div>
        )}

        {alerts > 0 && (
          <div className="mt-4 flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{alerts} alerts</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InstanceTile;
