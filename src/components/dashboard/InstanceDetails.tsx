import React from "react";
import type { Instance } from "./InstanceGrid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const InstanceDetails = ({ instance, onClose }) => {
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
    <div className="flex flex-col">
      <Tabs defaultValue="metrics" className="flex-1 flex flex-col">
        <div className="bg-background z-10">
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
              <TabsTrigger value="events" className="flex items-center gap-2">
                Events
                <Badge variant="secondary" className="h-5 px-1.5">
                  {instance.events}
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
              {/* CPU Usage Chart */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">CPU Usage</h3>
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
                <h3 className="text-lg font-semibold mb-4">Disk I/O</h3>
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

              {/* Response Time Chart */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Response Time</h3>
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

              {/* Total Time Chart */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Total Time</h3>
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
            </div>
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

export default InstanceDetails;
