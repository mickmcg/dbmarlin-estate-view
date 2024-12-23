import React from "react";
import type { Instance } from "./InstanceGrid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  HardDrive,
  Clock,
  AlertTriangle,
  Database,
  Code,
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

interface Event {
  id: string;
  type: "schema_change" | "code_change" | "alert";
  timestamp: string;
  description: string;
  severity?: "low" | "medium" | "high";
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  category: "performance" | "security" | "reliability";
}

const mockEvents: Event[] = [
  {
    id: "1",
    type: "schema_change",
    timestamp: "2024-01-20 14:30",
    description: "Added index on users.email",
  },
  {
    id: "2",
    type: "code_change",
    timestamp: "2024-01-20 13:15",
    description: "Updated query optimization for user search",
  },
  {
    id: "3",
    type: "alert",
    timestamp: "2024-01-20 12:00",
    description: "High CPU usage detected",
    severity: "high",
  },
];

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    title: "Optimize Query Performance",
    description: "Add index on frequently queried columns",
    impact: "high",
    category: "performance",
  },
  {
    id: "2",
    title: "Enable Query Caching",
    description: "Implement result caching for common queries",
    impact: "medium",
    category: "performance",
  },
];

const generateMockTimeData = (value: number, variance: number = 20) => {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const time = new Date(now.getTime() - (23 - i) * 3600000);
    const baseValue = value + Math.sin(i / 4) * (variance / 2);
    return {
      time: time.toLocaleTimeString([], { hour: "2-digit", hour12: false }),
      value: Math.max(
        0,
        Math.min(100, baseValue + (Math.random() - 0.5) * variance),
      ),
    };
  });
};

const MetricChart = ({
  title,
  metric,
  color,
  icon: Icon,
  unit = "%",
  data,
}: {
  title: string;
  metric: number | string;
  color: string;
  icon: React.ElementType;
  unit?: string;
  data?: Array<{ time: string; value: number }>;
}) => (
  <Card className="p-4 space-y-2">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      <h3 className="text-sm font-medium">{title}</h3>
    </div>
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            fontSize={10}
            tickFormatter={(value) => value.split(":")[0]}
          />
          <YAxis fontSize={10} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold flex items-center gap-2">
        {typeof metric === "number" ? `${metric}${unit}` : metric}
      </span>
      <span className={color}>+2.5%</span>
    </div>
  </Card>
);

const EventRow = ({ event }: { event: Event }) => {
  const getIcon = () => {
    switch (event.type) {
      case "schema_change":
        return <Database className="w-4 h-4" />;
      case "code_change":
        return <Code className="w-4 h-4" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="flex items-center gap-4 py-2">
      {getIcon()}
      <div className="flex-1">
        <p className="text-sm font-medium">{event.description}</p>
        <p className="text-xs text-muted-foreground">{event.timestamp}</p>
      </div>
      {event.severity && (
        <Badge
          variant={event.severity === "high" ? "destructive" : "secondary"}
        >
          {event.severity}
        </Badge>
      )}
    </div>
  );
};

const RecommendationRow = ({
  recommendation,
}: {
  recommendation: Recommendation;
}) => (
  <Card className="p-4 space-y-2">
    <div className="flex items-center justify-between">
      <h4 className="font-medium">{recommendation.title}</h4>
      <Badge
        variant={recommendation.impact === "high" ? "destructive" : "secondary"}
      >
        {recommendation.impact} impact
      </Badge>
    </div>
    <p className="text-sm text-muted-foreground">
      {recommendation.description}
    </p>
    <Badge variant="outline">{recommendation.category}</Badge>
  </Card>
);

const InstanceDetails = ({ instance }: { instance: Instance }) => {
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{instance.name}</h2>
          <Badge variant="outline" className="text-sm">
            {instance.dbType}
          </Badge>
        </div>
        <div className="flex gap-2">
          {Object.entries(instance.tags).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="text-xs">
              {key}={value}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        <Tabs defaultValue="metrics">
          <TabsList className="mb-4">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MetricChart
                title="CPU Usage"
                metric={instance.cpuUsage}
                color="var(--primary)"
                icon={Activity}
                data={cpuData}
              />
              <MetricChart
                title="Disk I/O"
                metric={instance.diskIO}
                color="var(--primary)"
                icon={HardDrive}
                data={diskIOData}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MetricChart
                title="Response Time"
                metric={instance.responseTime}
                color="var(--primary)"
                icon={Activity}
                unit="ms"
                data={responseTimeData}
              />
              <MetricChart
                title="Total Time"
                metric={instance.totalTime}
                color="var(--primary)"
                icon={Clock}
                unit=""
              />
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="divide-y">
              {mockEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {mockRecommendations.map((recommendation) => (
              <RecommendationRow
                key={recommendation.id}
                recommendation={recommendation}
              />
            ))}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

export default InstanceDetails;
