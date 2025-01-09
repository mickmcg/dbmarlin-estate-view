import React, { useMemo } from "react";
import type { Instance, InstanceStatus, SortBy } from "./InstanceGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  HardDrive,
  Clock,
  X,
  AlertTriangle,
  Database,
  Code,
  ArrowUpDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface GroupDetailsProps {
  groupName: string;
  instances: Instance[];
  sortBy?: SortBy;
  sortOrder?: "asc" | "desc";
  onSortChange?: (field: SortBy) => void;
  onClose?: () => void;
}

const generateMultiSeriesData = (
  instances: Instance[],
  metric: keyof Instance,
  points = 24,
) => {
  const timePoints = Array.from({ length: points }, (_, i) => `${i}:00`);

  // Create a map of instance data
  const instanceData = instances.map((instance) => {
    const baseValue = Number(instance[metric]) || 0;
    return {
      name: instance.name,
      data: Array.from({ length: points }, () =>
        Math.max(0, baseValue + Math.floor(Math.random() * 40) - 20),
      ),
    };
  });

  // Combine into time-based data points
  return timePoints.map((time, i) => ({
    time,
    ...instanceData.reduce(
      (acc, { name, data }) => ({
        ...acc,
        [name]: data[i],
      }),
      {},
    ),
  }));
};

const getStatusBadgeClass = (status: InstanceStatus) => {
  switch (status) {
    case "healthy":
      return "bg-green-500 hover:bg-green-500/90 text-white border-0";
    case "warning":
      return "bg-orange-500 hover:bg-orange-500/90 text-white border-0";
    case "critical":
      return "bg-red-500 hover:bg-red-500/90 text-white border-0";
    case "offline":
      return "bg-gray-500 hover:bg-gray-500/90 text-white border-0";
    default:
      return "";
  }
};

const GroupDetails = ({
  groupName,
  instances,
  sortBy = "name",
  sortOrder = "asc",
  onSortChange,
  onClose,
}: GroupDetailsProps) => {
  const metrics = useMemo(() => {
    return {
      totalEvents: instances.reduce(
        (sum, instance) => sum + instance.events,
        0,
      ),
      avgCpuUsage: Math.round(
        instances.reduce((sum, instance) => sum + instance.cpuUsage, 0) /
          instances.length,
      ),
      avgDiskIO: Math.round(
        instances.reduce((sum, instance) => sum + instance.diskIO, 0) /
          instances.length,
      ),
      avgResponseTime: Math.round(
        instances.reduce((sum, instance) => sum + instance.responseTime, 0) /
          instances.length,
      ),
    };
  }, [instances]);

  const chartData = useMemo(
    () => ({
      cpuData: generateMultiSeriesData(instances, "cpuUsage"),
      diskIOData: generateMultiSeriesData(instances, "diskIO"),
      responseTimeData: generateMultiSeriesData(instances, "responseTime"),
      totalTimeData: generateMultiSeriesData(instances, "executions"),
    }),
    [instances],
  );

  const SortButton = ({
    field,
    label,
    className = "",
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
    <div className="flex flex-col">
      <Tabs defaultValue="metrics" className="flex-1 flex flex-col">
        <div className="sticky top-0 bg-background z-10">
          <div className="h-[80px] px-8 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{groupName}</h2>
              <Badge variant="outline">{instances.length} instances</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-8 py-3 border-b">
            <TabsList>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                Events
                <Badge variant="secondary" className="h-5 px-1.5">
                  {metrics.totalEvents}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="flex items-center gap-2"
              >
                Recommendations
                <Badge variant="secondary" className="h-5 px-1.5">
                  3
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="metrics" className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Avg CPU Usage
                </div>
                <div className="text-2xl font-bold">{metrics.avgCpuUsage}%</div>
              </Card>
              <Card className="p-4 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Avg Disk I/O
                </div>
                <div className="text-2xl font-bold">{metrics.avgDiskIO}%</div>
              </Card>
              <Card className="p-4 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Avg Response Time
                </div>
                <div className="text-2xl font-bold">
                  {metrics.avgResponseTime}ms
                </div>
              </Card>
              <Card className="p-4 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Total Events
                </div>
                <div className="text-2xl font-bold">{metrics.totalEvents}</div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CPU Usage Chart */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">CPU Usage</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.cpuData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {instances.map((instance, index) => (
                        <Line
                          key={instance.id}
                          type="monotone"
                          dataKey={instance.name}
                          stroke={`hsl(${(index * 360) / instances.length}, 70%, 50%)`}
                          name={instance.name}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Disk I/O Chart */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Disk I/O</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.diskIOData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {instances.map((instance, index) => (
                        <Line
                          key={instance.id}
                          type="monotone"
                          dataKey={instance.name}
                          stroke={`hsl(${(index * 360) / instances.length}, 70%, 50%)`}
                          name={instance.name}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Response Time Chart */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Response Time</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {instances.map((instance, index) => (
                        <Line
                          key={instance.id}
                          type="monotone"
                          dataKey={instance.name}
                          stroke={`hsl(${(index * 360) / instances.length}, 70%, 50%)`}
                          name={instance.name}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Total Time Chart */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Total Time</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.totalTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {instances.map((instance, index) => (
                        <Line
                          key={instance.id}
                          type="monotone"
                          dataKey={instance.name}
                          stroke={`hsl(${(index * 360) / instances.length}, 70%, 50%)`}
                          name={instance.name}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Instance List */}
            <Card className="p-0">
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
                  <SortButton
                    field="alerts"
                    label="Alerts"
                    className="justify-center"
                  />
                </div>
                <div className="flex-1 text-center">
                  <SortButton
                    field="changes"
                    label="Changes"
                    className="justify-center"
                  />
                </div>
                <div className="flex-1 text-center">
                  <SortButton
                    field="events"
                    label="Events"
                    className="justify-center"
                  />
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
                  <SortButton
                    field="cpuUsage"
                    label="CPU"
                    className="justify-center"
                  />
                </div>
                <div className="flex-1 text-center">
                  <SortButton
                    field="diskIO"
                    label="Disk I/O"
                    className="justify-center"
                  />
                </div>
              </div>
              <div className="space-y-[1px]">
                {instances.map((instance) => (
                  <div
                    key={instance.id}
                    className="flex items-center h-14 hover:bg-accent/50 cursor-pointer text-sm w-full"
                  >
                    <div className="flex-[2] truncate pl-4">
                      <span className="font-medium">{instance.name}</span>
                    </div>
                    <div className="flex-1">
                      <Badge
                        variant="secondary"
                        className={`capitalize ${getStatusBadgeClass(
                          instance.status,
                        )}`}
                      >
                        {instance.status}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline">{instance.dbType}</Badge>
                    </div>
                    <div className="flex-1 text-center">
                      {instance.alerts > 0 && (
                        <div className="flex items-center justify-center gap-1 text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          {instance.alerts}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center">{instance.changes}</div>
                    <div className="flex-1 text-center">{instance.events}</div>
                    <div className="flex-[1.2] text-center">
                      {instance.totalTime}
                    </div>
                    <div className="flex-[1.2] text-center">
                      {instance.executions.toLocaleString()}
                    </div>
                    <div className="flex-1 text-center">
                      {instance.responseTime}ms
                    </div>
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Activity className="h-3 w-3" />
                        {instance.cpuUsage}%
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {instance.diskIO}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Card className="p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Event History</h3>
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">
                        {
                          [
                            "Schema Change",
                            "Performance Alert",
                            "Configuration Update",
                            "Backup Completed",
                          ][i % 4]
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {i + 1} hour{i !== 0 ? "s" : ""} ago
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        i % 3 === 0
                          ? getStatusBadgeClass("critical")
                          : i % 3 === 1
                            ? getStatusBadgeClass("warning")
                            : ""
                      }
                    >
                      {i % 3 === 0
                        ? "Critical"
                        : i % 3 === 1
                          ? "Warning"
                          : "Info"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <Card className="p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Performance Recommendations
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                  <Database className="h-8 w-8 p-2 bg-primary/10 rounded-lg" />
                  <div className="space-y-1 flex-1">
                    <div className="font-medium">
                      Optimize Query Performance
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Consider adding an index for frequently accessed columns
                    </div>
                  </div>
                  <Badge variant="secondary">High Impact</Badge>
                </div>
                <div className="flex items-center gap-4 border-b pb-4">
                  <Activity className="h-8 w-8 p-2 bg-primary/10 rounded-lg" />
                  <div className="space-y-1 flex-1">
                    <div className="font-medium">Resource Utilization</div>
                    <div className="text-sm text-muted-foreground">
                      CPU usage consistently high, consider scaling resources
                    </div>
                  </div>
                  <Badge variant="secondary">Medium Impact</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="h-8 w-8 p-2 bg-primary/10 rounded-lg" />
                  <div className="space-y-1 flex-1">
                    <div className="font-medium">Maintenance Window</div>
                    <div className="text-sm text-muted-foreground">
                      Schedule regular maintenance during off-peak hours
                    </div>
                  </div>
                  <Badge variant="secondary">Low Impact</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDetails;
