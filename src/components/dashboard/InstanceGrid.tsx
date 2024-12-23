import React from "react";
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

interface Instance {
  id: string;
  name: string;
  status: string;
  cpuUsage: number;
  diskIO: number;
  responseTime: number;
  alerts: number;
  changes: number;
  events: number;
  executions: number;
  totalTime: string;
  dbType: string;
  tags: Record<string, string>;
}

interface InstanceGridProps {
  instances?: Instance[];
  layout?: ViewLayout;
  groupBy?: GroupBy;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
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
    width,
  }: {
    field: SortBy;
    label: string;
    width: string;
  }) => (
    <Button
      variant="ghost"
      className={`h-8 px-2 justify-start font-medium ${width} hover:bg-transparent hover:text-primary`}
      onClick={() => onSortChange?.(field)}
    >
      {label}
      {sortBy === field && <ArrowUpDown className="ml-1 h-3 w-3" />}
    </Button>
  );

  return (
    <div className="flex items-center px-3 border-b bg-muted/50 text-sm sticky top-0">
      <SortButton field="name" label="Name" width="w-[180px]" />
      <SortButton field="status" label="Health" width="w-[100px]" />
      <SortButton field="dbType" label="Type" width="w-[100px]" />
      <SortButton field="alerts" label="Alerts" width="w-[80px] text-center" />
      <SortButton
        field="changes"
        label="Changes"
        width="w-[80px] text-center"
      />
      <SortButton field="events" label="Events" width="w-[80px] text-center" />
      <SortButton
        field="totalTime"
        label="Total Time"
        width="w-[120px] text-center"
      />
      <SortButton
        field="executions"
        label="Executions"
        width="w-[120px] text-center"
      />
      <SortButton
        field="responseTime"
        label="Response"
        width="w-[100px] text-center"
      />
      <SortButton field="severity" label="CPU" width="w-[80px] text-center" />
      <SortButton
        field="diskIO"
        label="Disk I/O"
        width="w-[80px] text-center"
      />
    </div>
  );
};

const parseTimeToSeconds = (timeStr: string) => {
  const hours = timeStr.match(/(\d+)h/)?.[1] || "0";
  const minutes = timeStr.match(/(\d+)m/)?.[1] || "0";
  const seconds = timeStr.match(/(\d+)s/)?.[1] || "0";

  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
};

const InstanceGrid = ({
  instances = defaultInstances,
  layout = "comfortable",
  groupBy = "none",
  sortBy = "name",
  sortOrder = "asc",
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
        return "space-y-[1px]";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
    }
  };

  const compareValues = (a: Instance, b: Instance, field: string) => {
    if (field === "totalTime") {
      return parseTimeToSeconds(a[field]) - parseTimeToSeconds(b[field]);
    }
    return (
      (a[field as keyof Instance] || 0) - (b[field as keyof Instance] || 0)
    );
  };

  const sortInstances = (instances: Instance[]) => {
    return [...instances].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "severity":
          const severityOrder = {
            healthy: 0,
            warning: 1,
            critical: 2,
            offline: 3,
          };
          comparison =
            severityOrder[a.status as keyof typeof severityOrder] -
            severityOrder[b.status as keyof typeof severityOrder];
          break;
        case "status":
          const healthOrder = {
            healthy: 0,
            warning: 1,
            critical: 2,
            offline: 3,
          };
          comparison =
            healthOrder[a.status as keyof typeof healthOrder] -
            healthOrder[b.status as keyof typeof healthOrder];
          break;
        case "dbType":
          comparison = a.dbType.localeCompare(b.dbType);
          break;
        default:
          comparison = compareValues(a, b, sortBy);
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
            const tagKey = groupBy.split(":")[1];
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
    <div className="p-6 overflow-auto">
      {Object.entries(groupedInstances).map(([group, instances]) => (
        <div key={group} className="space-y-1 mb-8">
          {group !== "Instances" && (
            <h2 className="text-lg font-semibold capitalize mb-4">{group}</h2>
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
