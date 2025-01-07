import React from "react";
import type { Instance, InstanceStatus } from "./InstanceGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (field: string) => void;
  onClose?: () => void;
}

const ListHeader = ({
  sortBy,
  onSortChange,
}: {
  sortBy: string;
  onSortChange?: (field: string) => void;
}) => {
  const SortButton = ({
    field,
    label,
    className,
  }: {
    field: string;
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
        <SortButton field="cpuUsage" label="CPU" className="justify-center" />
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

const generateTimeData = (instances: Instance[]) => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = `${i}:00`;
    return {
      time: hour,
      ...instances.reduce((acc, instance, idx) => {
        acc[`cpu${idx}`] = Math.max(
          0,
          instance.cpuUsage + Math.floor(Math.random() * 40) - 20,
        );
        acc[`disk${idx}`] = Math.max(
          0,
          instance.diskIO + Math.floor(Math.random() * 40) - 20,
        );
        acc[`response${idx}`] = Math.max(
          0,
          instance.responseTime + Math.floor(Math.random() * 100) - 50,
        );
        acc[`total${idx}`] = Math.max(
          60,
          90 + Math.floor(Math.random() * 40) - 20,
        );
        return acc;
      }, {}),
    };
  });
};

const parseTimeToSeconds = (timeStr: string): number => {
  const hours = parseInt(timeStr.match(/(\d+)h/)?.[1] || "0");
  const minutes = parseInt(timeStr.match(/(\d+)m/)?.[1] || "0");
  const seconds = parseInt(timeStr.match(/(\d+)s/)?.[1] || "0");

  return hours * 3600 + minutes * 60 + seconds;
};

const sortInstances = (
  instances: Instance[],
  sortBy: string,
  sortOrder: "asc" | "desc",
) => {
  const compareValues = (
    a: Instance,
    b: Instance,
    field: keyof Instance,
  ): number => {
    if (field === "totalTime") {
      return (
        parseTimeToSeconds(a[field] as string) -
        parseTimeToSeconds(b[field] as string)
      );
    }
    if (typeof a[field] === "number" && typeof b[field] === "number") {
      return (a[field] as number) - (b[field] as number);
    }
    return 0;
  };

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

const GroupDetails = ({
  groupName,
  instances,
  sortBy = "name",
  sortOrder = "asc",
  onSortChange,
  onClose,
}: GroupDetailsProps) => {
  const timeData = generateTimeData(instances);
  const sortedInstances = sortInstances(instances, sortBy, sortOrder);

  const colors = [
    "#2563eb",
    "#16a34a",
    "#9333ea",
    "#e11d48",
    "#0891b2",
    "#4f46e5",
    "#db2777",
    "#d97706",
  ];

  const metrics = {
    totalInstances: instances.length,
    healthyInstances: instances.filter((i) => i.status === "healthy").length,
    warningInstances: instances.filter((i) => i.status === "warning").length,
    criticalInstances: instances.filter((i) => i.status === "critical").length,
    offlineInstances: instances.filter((i) => i.status === "offline").length,
    avgCpuUsage: Math.round(
      instances.reduce((acc, i) => acc + i.cpuUsage, 0) / instances.length,
    ),
    avgDiskIO: Math.round(
      instances.reduce((acc, i) => acc + i.diskIO, 0) / instances.length,
    ),
    avgResponseTime: Math.round(
      instances.reduce((acc, i) => acc + i.responseTime, 0) / instances.length,
    ),
    totalAlerts: instances.reduce((acc, i) => acc + i.alerts, 0),
    totalEvents: instances.reduce((acc, i) => acc + i.events, 0),
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <Tabs defaultValue="metrics" className="flex-1 overflow-hidden">
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
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="metrics" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-186px)]">
            <div className="p-6 space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    CPU Usage (Avg)
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.avgCpuUsage}%
                  </div>
                </Card>
                <Card className="p-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Disk I/O (Avg)
                  </div>
                  <div className="text-2xl font-bold">{metrics.avgDiskIO}%</div>
                </Card>
                <Card className="p-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Response Time (Avg)
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.avgResponseTime}ms
                  </div>
                </Card>
                <Card className="p-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Alerts
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.totalAlerts}
                  </div>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Response Time Chart */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Response Time Over Time
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {instances.map((instance, idx) => (
                          <Line
                            key={instance.id}
                            type="monotone"
                            dataKey={`response${idx}`}
                            name={instance.name}
                            stroke={colors[idx % colors.length]}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Total DB Time Chart */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Total DB Time Over Time
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {instances.map((instance, idx) => (
                          <Line
                            key={instance.id}
                            type="monotone"
                            dataKey={`total${idx}`}
                            name={instance.name}
                            stroke={colors[idx % colors.length]}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* CPU Usage Chart */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    CPU Usage Over Time
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {instances.map((instance, idx) => (
                          <Line
                            key={instance.id}
                            type="monotone"
                            dataKey={`cpu${idx}`}
                            name={instance.name}
                            stroke={colors[idx % colors.length]}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Disk I/O Chart */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Disk I/O Over Time
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {instances.map((instance, idx) => (
                          <Line
                            key={instance.id}
                            type="monotone"
                            dataKey={`disk${idx}`}
                            name={instance.name}
                            stroke={colors[idx % colors.length]}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Metrics Table */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Instance Metrics</h3>
                <div className="space-y-0">
                  <ListHeader sortBy={sortBy} onSortChange={onSortChange} />
                  {sortedInstances.map((instance) => (
                    <div
                      key={instance.id}
                      className={`flex items-center h-14 hover:bg-accent/50 cursor-pointer text-sm border-b last:border-b-0 w-full ${instance.status === "healthy" ? "bg-green-50/50 dark:bg-green-500/5" : instance.status === "warning" ? "bg-yellow-50/50 dark:bg-yellow-500/5" : instance.status === "critical" ? "bg-red-50/50 dark:bg-red-500/5" : "bg-gray-50/50 dark:bg-gray-500/5"}`}
                    >
                      <div className="flex-[2] truncate pl-4">
                        <span className="font-medium">{instance.name}</span>
                      </div>
                      <div className="flex-1">
                        <Badge
                          variant={
                            instance.status === "healthy"
                              ? "success"
                              : instance.status === "warning"
                                ? "warning"
                                : instance.status === "critical"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="capitalize text-xs px-1.5 py-0"
                        >
                          {instance.status}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0"
                        >
                          {instance.dbType}
                        </Badge>
                      </div>
                      <div className="flex-1 text-center">
                        {instance.alerts > 0 && (
                          <div className="flex items-center justify-center gap-1 text-red-500">
                            <AlertTriangle className="h-3 w-3" />
                            {instance.alerts}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center">
                        {instance.changes}
                      </div>
                      <div className="flex-1 text-center">
                        {instance.events}
                      </div>
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
                          <span>{instance.cpuUsage}%</span>
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          <span>{instance.diskIO}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="events" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-186px)]">
            <div className="p-6 space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
                <div className="space-y-4">
                  {instances.map((instance) => (
                    <div
                      key={instance.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{instance.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {instance.events} events
                        </div>
                      </div>
                      <Badge variant="outline">{instance.dbType}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recommendations" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-186px)]">
            <div className="p-6 space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Performance Recommendations
                </h3>
                <div className="space-y-4">
                  {instances.map((instance) => (
                    <div
                      key={instance.id}
                      className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                    >
                      <Code className="h-8 w-8 p-2 bg-primary/10 rounded-lg" />
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">{instance.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Consider optimizing queries with high execution time
                        </div>
                      </div>
                      <Badge>High Impact</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDetails;
