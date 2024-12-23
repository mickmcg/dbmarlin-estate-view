import React from "react";
import InstanceTile from "./InstanceTile";

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
  | "responseTime";
type SortOrder = "asc" | "desc";

interface InstanceGridProps {
  instances?: any[];
  layout?: ViewLayout;
  groupBy?: GroupBy;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  onInstanceClick?: (instance: any) => void;
  onSortChange?: (field: string) => void;
}

const defaultInstances: any[] = [];

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

  const sortInstances = (instances: any[]) => {
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
        case "dbType":
          comparison = a.dbType.localeCompare(b.dbType);
          break;
        default:
          comparison = (a[sortBy] || 0) - (b[sortBy] || 0);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  const groupInstances = (instances: any[]) => {
    if (groupBy === "none") return { Instances: instances };

    return instances.reduce((groups: Record<string, any[]>, instance) => {
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
        <div key={group} className="space-y-6 mb-8">
          {group !== "Instances" && (
            <h2 className="text-lg font-semibold capitalize">{group}</h2>
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
