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

const generateMockTimeData = (baseValue: number, points = 24) => {
  return Array.from({ length: points }, (_, i) => ({
    time: `${i}:00`,
    value: Math.max(0, baseValue + Math.floor(Math.random() * 40) - 20),
  }));
};

interface InstanceDetailsProps {
  instance: Instance;
  onClose?: () => void;
}

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
                  variant={
                    instance.status === "healthy"
                      ? "success"
                      : instance.status === "warning"
                        ? "warning"
                        : instance.status === "critical"
                          ? "destructive"
                          : "outline"
                  }
                  className="capitalize"
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
                          stroke="#2563eb"
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
                          stroke="#16a34a"
                          name="Disk I/O"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Metrics Table */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Instance Metrics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Metric</th>
                        <th className="text-left py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">CPU Usage</td>
                        <td className="py-2">{instance.cpuUsage}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Disk I/O</td>
                        <td className="py-2">{instance.diskIO}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Response Time</td>
                        <td className="py-2">{instance.responseTime}ms</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Total Time</td>
                        <td className="py-2">{instance.totalTime}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Alerts</td>
                        <td className="py-2">{instance.alerts}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Events</td>
                        <td className="py-2">{instance.events}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Changes</td>
                        <td className="py-2">{instance.changes}</td>
                      </tr>
                      <tr className="border-b last:border-0">
                        <td className="py-2">Executions</td>
                        <td className="py-2">{instance.executions}</td>
                      </tr>
                    </tbody>
                  </table>
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
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">Query Execution</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 60)} minutes ago
                        </div>
                      </div>
                      <Badge variant="outline">Performance</Badge>
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
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                    >
                      <AlertTriangle className="h-8 w-8 p-2 bg-primary/10 rounded-lg" />
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">High CPU Usage</div>
                        <div className="text-sm text-muted-foreground">
                          Consider optimizing queries or increasing resources
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

export default InstanceDetails;
