import React, { useMemo } from "react";
import InstanceTile from "./InstanceTile";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

type ViewLayout = "compact" | "comfortable" | "list";
type GroupBy = "none" | "server" | "health" | "dbType" | string;
type SortBy =
  | "name"
  | "severity"
  | "dbType"
  | "changes"
  | "events"
  | "totalTime"
  | "executions"
  | "responseTime"
  | "alerts"
  | "status"
  | "diskIO";
type SortOrder = "asc" | "desc";
type InstanceStatus = "healthy" | "warning" | "critical" | "offline";

interface InstanceTags {
  env: string;
  app: string;
  dc: string;
  customer: string;
}

interface Instance {
  id: string;
  name: string;
  status: InstanceStatus;
  cpuUsage: number;
  diskIO: number;
  responseTime: number;
  alerts: number;
  changes: number;
  events: number;
  executions: number;
  totalTime: string;
  dbType: string;
  tags: InstanceTags;
}

interface InstanceGridProps {
  instances?: Instance[];
  layout?: ViewLayout;
  groupBy?: GroupBy;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  onGroupClick?: (groupName: string, instances: Instance[]) => void;
  onInstanceClick?: (instance: Instance) => void;
  onSortChange?: (field: string) => void;
}

const defaultInstances: Instance[] = [];

const ListHeader = ({
  sortBy,
  onSortChange,
}: {
  sortBy: SortBy;
  onSortChange?: (field: string) => void;
}) => {
  const SortButton = ({
    field,
    label,
    className,
  }: {
    field: SortBy;
    label: string;
    className?: string;
  }) => (
    <Button
      variant="ghost"
      className={`h-8 px-2 justify-start font-medium hover:bg-transparent hover:text-primary ${className}`}
      onClick={() => onSortChange?.(field)}
    >
      {label}
      {sortBy === field && <ArrowUpDown className="ml-1 h-3 w-3" />}
    </Button>
  );

  return (
    <div className="flex items-center h-14 px-3 border-b bg-muted/50 text-sm sticky top-0 w-full">
      <div className="flex-[2] pl-4">
        <SortButton field="name" label="Name" />
      </div>
      <div className="flex-1">
        <SortButton field="status" label="Health" />
      </div>
      <div className="flex-1">
        <SortButton field="dbType" label="Type" />
      </div>
      <div className="flex-1 text-center">
        <SortButton field="alerts" label="Alerts" className="justify-center" />
      </div>
      <div className="flex-1 text-center">
        <SortButton
          field="changes"
          label="Changes"
          className="justify-center"
        />
      </div>
      <div className="flex-1 text-center">
        <SortButton field="events" label="Events" className="justify-center" />
      </div>
      <div className="flex-[1.2] text-center">
        <SortButton
          field="totalTime"
          label="Total Time"
          className="justify-center"
        />
      </div>
      <div className="flex-[1.2] text-center">
        <SortButton
          field="executions"
          label="Executions"
          className="justify-center"
        />
      </div>
      <div className="flex-1 text-center">
        <SortButton
          field="responseTime"
          label="Response"
          className="justify-center"
        />
      </div>
      <div className="flex-1 text-center">
        <SortButton field="severity" label="CPU" className="justify-center" />
      </div>
      <div className="flex-1 text-center">
        <SortButton
          field="diskIO"
          label="Disk I/O"
          className="justify-center"
        />
      </div>
    </div>
  );
};

const parseTimeToSeconds = (timeStr: string): number => {
  const hours = parseInt(timeStr.match(/(\d+)h/)?.[1] || "0");
  const minutes = parseInt(timeStr.match(/(\d+)m/)?.[1] || "0");
  const seconds = parseInt(timeStr.match(/(\d+)s/)?.[1] || "0");

  return hours * 3600 + minutes * 60 + seconds;
};

const InstanceGrid = ({
  instances = defaultInstances,
  layout = "comfortable",
  groupBy = "none",
  sortBy = "name",
  sortOrder = "asc",
  onGroupClick,
  onInstanceClick,
  onSortChange,
}: InstanceGridProps) => {
  const getTileSize = () => {
    switch (layout) {
      case "compact":
        return "small";
      case "comfortable":
        return "medium";
      case "list":
        return "large";
      default:
        return "medium";
    }
  };

  const getGridLayout = () => {
    switch (layout) {
      case "compact":
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4";
      case "comfortable":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
      case "list":
        return "space-y-[1px] w-full";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
    }
  };

  const compareValues = (
    a: Instance,
    b: Instance,
    field: keyof Instance,
  ): number => {
    if (field === "totalTime") {
      return parseTimeToSeconds(a[field]) - parseTimeToSeconds(b[field]);
    }
    if (typeof a[field] === "number" && typeof b[field] === "number") {
      return (a[field] as number) - (b[field] as number);
    }
    return 0;
  };

  const sortInstances = (instances: Instance[]) => {
    return [...instances].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "severity":
        case "status":
          const severityOrder: Record<InstanceStatus, number> = {
            healthy: 0,
            warning: 1,
            critical: 2,
            offline: 3,
          };
          comparison = severityOrder[a.status] - severityOrder[b.status];
          break;
        case "dbType":
          comparison = a.dbType.localeCompare(b.dbType);
          break;
        default:
          comparison = compareValues(a, b, sortBy as keyof Instance);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  const groupInstances = (instances: Instance[]) => {
    if (groupBy === "none") return { Instances: instances };

    return instances.reduce((groups: Record<string, Instance[]>, instance) => {
      let groupKey = "";

      switch (groupBy) {
        case "server":
          groupKey = instance.tags.dc;
          break;
        case "health":
          groupKey = instance.status;
          break;
        case "dbType":
          groupKey = instance.dbType;
          break;
        default:
          if (groupBy.startsWith("tag:")) {
            const tagKey = groupBy.split(":")[1] as keyof InstanceTags;
            groupKey = instance.tags[tagKey] || "Other";
          }
      }

      if (!groupKey) groupKey = "Other";

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(instance);
      return groups;
    }, {});
  };

  const sortedInstances = sortInstances(instances);
  const groupedInstances = groupInstances(sortedInstances);

  return (
    <div className="p-6 overflow-auto min-w-0">
      {Object.entries(groupedInstances).map(([group, instances]) => (
        <div key={group} className="space-y-4 mb-8">
          {group !== "Instances" && (
            <div
              className="flex items-center gap-2 cursor-pointer group mb-4"
              onClick={() => onGroupClick?.(group, instances)}
            >
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">
                {group}
              </h2>
            </div>
          )}
          {layout === "list" && (
            <ListHeader sortBy={sortBy} onSortChange={onSortChange} />
          )}
          <div className={getGridLayout()}>
            {instances.map((instance) => (
              <InstanceTile
                key={instance.id}
                {...instance}
                size={getTileSize()}
                onViewDetails={() => onInstanceClick?.(instance)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InstanceGrid;
export type { Instance, InstanceStatus, InstanceTags };
