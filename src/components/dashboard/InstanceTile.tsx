import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  AlertTriangle,
  Activity,
  HardDrive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type InstanceStatus = "healthy" | "warning" | "critical" | "offline";
type TileSize = "small" | "medium" | "large" | "hover";

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
      bg: "bg-green-50 dark:bg-green-500/10",
    },
    warning: {
      text: "text-yellow-500",
      border: "border-l-4 border-l-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-500/10",
    },
    critical: {
      text: "text-red-500",
      border: "border-l-4 border-l-red-500",
      bg: "bg-red-50 dark:bg-red-500/10",
    },
    offline: {
      text: "text-gray-500",
      border: "border-l-4 border-l-gray-500",
      bg: "bg-gray-50 dark:bg-gray-500/10",
    },
  };
  return colors[status];
};

const TileContent = ({
  name,
  status,
  cpuUsage,
  diskIO,
  responseTime,
  alerts,
  dbType,
  totalTime,
  statusColors,
  size,
  onNameClick,
}: InstanceTileProps & {
  statusColors: ReturnType<typeof getStatusColor>;
  size: TileSize;
}) => (
  <div className={`${size === "small" ? "p-2" : "p-3"}`}>
    <div className="space-y-0.5">
      <Button
        variant="link"
        className="p-0 h-auto font-medium hover:no-underline text-sm"
        onClick={(e) => {
          e.stopPropagation();
          onNameClick?.();
        }}
      >
        {name}
      </Button>
      <div className="flex items-center gap-1">
        <Badge
          variant="outline"
          className={`${statusColors.text} capitalize text-xs px-1.5 py-0`}
        >
          {status}
        </Badge>
        <Badge variant="outline" className="text-xs px-1.5 py-0">
          {dbType}
        </Badge>
      </div>
    </div>

    {(size === "medium" || size === "hover") && (
      <div className="mt-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs font-medium">CPU Usage</div>
            <div className="text-lg font-bold">{cpuUsage}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium">Disk I/O</div>
            <div className="text-lg font-bold">{diskIO}%</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs font-medium">Response Time</div>
            <div className="text-lg font-bold">{responseTime}ms</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium">Total Time</div>
            <div className="text-lg font-bold">{totalTime}</div>
          </div>
        </div>
      </div>
    )}

    {alerts > 0 && size !== "small" && (
      <div className="mt-3 flex items-center gap-1 text-red-500">
        <AlertTriangle className="h-3 w-3" />
        <span className="text-xs">{alerts} alerts</span>
      </div>
    )}
  </div>
);

const InstanceTile = (props: InstanceTileProps) => {
  const {
    status,
    size = "medium",
    onViewDetails,
    changes,
    events,
    totalTime,
    executions,
    cpuUsage,
    diskIO,
    responseTime,
  } = props;
  const statusColors = getStatusColor(status);

  const getRowBackground = () => {
    switch (status) {
      case "healthy":
        return "bg-green-50/50 dark:bg-green-500/5";
      case "warning":
        return "bg-yellow-50/50 dark:bg-yellow-500/5";
      case "critical":
        return "bg-red-50/50 dark:bg-red-500/5";
      case "offline":
        return "bg-gray-50/50 dark:bg-gray-500/5";
      default:
        return "";
    }
  };

  if (size === "large") {
    return (
      <div
        className={`flex items-center h-14 ${getRowBackground()} hover:bg-accent/50 cursor-pointer text-sm border-b last:border-b-0 w-full`}
        onClick={onViewDetails}
      >
        <div className="flex-[2] truncate pl-4">
          <span className="font-medium">{props.name}</span>
        </div>
        <div className="flex-1">
          <Badge
            variant={
              status === "healthy"
                ? "success"
                : status === "warning"
                  ? "warning"
                  : status === "critical"
                    ? "destructive"
                    : "outline"
            }
            className="capitalize text-xs px-1.5 py-0"
          >
            {status}
          </Badge>
        </div>
        <div className="flex-1">
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            {props.dbType}
          </Badge>
        </div>
        <div className="flex-1 text-center">
          {props.alerts > 0 && (
            <div className="flex items-center justify-center gap-1 text-red-500">
              <AlertTriangle className="h-3 w-3" />
              {props.alerts}
            </div>
          )}
        </div>
        <div className="flex-1 text-center">{changes}</div>
        <div className="flex-1 text-center">{events}</div>
        <div className="flex-[1.2] text-center">{totalTime}</div>
        <div className="flex-[1.2] text-center">
          {executions.toLocaleString()}
        </div>
        <div className="flex-1 text-center">{responseTime}ms</div>
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <Activity className="h-3 w-3" />
            <span>{cpuUsage}%</span>
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <HardDrive className="h-3 w-3" />
            <span>{diskIO}%</span>
          </div>
        </div>
      </div>
    );
  }

  const card = (
    <Card
      className={`relative overflow-hidden ${statusColors.border} ${statusColors.bg} hover:bg-accent/50 cursor-pointer`}
      onClick={onViewDetails}
    >
      {size !== "small" && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.()}>
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <TileContent {...props} statusColors={statusColors} size={size} />
    </Card>
  );

  if (size === "small") {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>{card}</HoverCardTrigger>
        <HoverCardContent className="w-[300px] p-0" align="start" side="right">
          <TileContent {...props} statusColors={statusColors} size="hover" />
        </HoverCardContent>
      </HoverCard>
    );
  }

  return card;
};

export default InstanceTile;
