import React from "react";
import type { Instance } from "./InstanceGrid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Activity,
  HardDrive,
  Clock,
  X,
  AlertTriangle,
  Database,
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

interface InstanceDetailsProps {
  instance: Instance;
  onClose?: () => void;
}

const getStatusBadgeClass = (status: Instance["status"]) => {
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

const generateMockTimeData = (baseValue: number, points = 24) => {
  return Array.from({ length: points }, (_, i) => ({
    time: `${i}:00`,
    value: Math.max(0, baseValue + Math.floor(Math.random() * 40) - 20),
  }));
};

const InstanceDetails = ({ instance, onClose }: InstanceDetailsProps) => {
  const cpuData = React.useMemo(
    () => generateMockTimeData(instance.cpuUsage),
    [instance.cpuUsage],
  );
  const diskIOData = React.useMemo(
    () => generateMockTimeData(instance.diskIO),
    [instance.diskIO],
  );
  const responseTimeData = React.useMemo(
    () => generateMockTimeData(instance.responseTime, 100),
    [instance.responseTime],
  );
  const totalTimeData = React.useMemo(() => generateMockTimeData(100, 30), []);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <Tabs defaultValue="metrics" className="flex-1 overflow-hidden">
        <div className="sticky top-0 bg-background z-10">
          <div className="h-[80px] px-8 flex items-center justify-between border-b">
            <div className="flex flex-col justify-center gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{instance.name}</h2>
                <Badge
                  variant="secondary"
                  className={`capitalize ${getStatusBadgeClass(instance.status)}`}
                >
                  {instance.status}
                </Badge>
                <Badge variant="outline">{instance.dbType}</Badge>
              </div>
              <div className="flex gap-2">
                {Object.entries(instance.tags).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key}={value}
                  </Badge>
                ))}
              </div>
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
                    CPU Usage
                  </div>
                  <div className="text-2xl font-bold">{instance.cpuUsage}%</div>
                </Card>
                <Card className="p-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Disk I/O
                  </div>
                  <div className="text-2xl font-bold">{instance.diskIO}%</div>
                </Card>
                <Card className="p-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Response Time
                  </div>
                  <div className="text-2xl font-bold">
                    {instance.responseTime}ms
                  </div>
                </Card>
                <Card className="p-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Time
                  </div>
                  <div className="text-2xl font-bold">{instance.totalTime}</div>
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
                      <LineChart data={responseTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#9333ea"
                          name="Response Time"
                        />
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
                      <LineChart data={totalTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#e11d48"
                          name="Total Time"
                        />
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
                      <LineChart data={cpuData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#16a34a"
                          name="CPU Usage"
                        />
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
                      <LineChart data={diskIOData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#0891b2"
                          name="Disk I/O"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Events and Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Schema Change</div>
                        <div className="text-xs text-muted-foreground">
                          2 minutes ago
                        </div>
                      </div>
                      <Badge variant="secondary">DDL</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          Performance Alert
                        </div>
                        <div className="text-xs text-muted-foreground">
                          15 minutes ago
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={getStatusBadgeClass("critical")}
                      >
                        Critical
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Active Alerts ({instance.alerts})
                  </h3>
                  <div className="space-y-4">
                    {instance.alerts > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            High CPU Usage
                          </div>
                          <div className="text-xs text-muted-foreground">
                            CPU usage above 80% for 5 minutes
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={getStatusBadgeClass("critical")}
                        >
                          Critical
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="events" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-186px)]">
            <div className="p-6">
              <Card className="p-4">
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
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstanceDetails;
