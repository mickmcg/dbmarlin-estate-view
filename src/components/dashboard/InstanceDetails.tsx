import React from "react";
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
  FileText,
} from "lucide-react";

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

interface InstanceDetailsProps {
  instance: any;
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

const MetricChart = ({
  title,
  metric,
  color,
}: {
  title: string;
  metric: number;
  color: string;
}) => (
  <Card className="p-4 space-y-2">
    <h3 className="text-sm font-medium">{title}</h3>
    <div className="h-[200px] bg-muted rounded-md" />
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold">{metric}%</span>
      <span className={`text-sm ${color}`}>+2.5%</span>
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

const InstanceDetails = ({ instance }: InstanceDetailsProps) => {
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
                color="text-green-500"
              />
              <MetricChart
                title="Disk I/O"
                metric={instance.diskIO}
                color="text-blue-500"
              />
            </div>
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-2">Response Time</h3>
              <div className="h-[300px] bg-muted rounded-md" />
            </Card>
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
