import React, { useState, useEffect } from "react";
import type { Instance, InstanceStatus } from "./dashboard/InstanceGrid";
import DashboardHeader from "./dashboard/DashboardHeader";
import ViewControls from "./dashboard/ViewControls";
import InstanceGrid from "./dashboard/InstanceGrid";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import InstanceDetails from "./dashboard/InstanceDetails";
import { useViewPreferences } from "@/lib/hooks/useViewPreferences";
import { useSearchParams } from "react-router-dom";

type ViewLayout = "compact" | "comfortable" | "list";
type GroupBy = "none" | "server" | "health" | "dbType";
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

interface TagFilter {
  key: string;
  value: string;
}

const getRandomElement = <T extends unknown>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const formatTotalTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const dbTypes = [
  "postgresql",
  "mysql",
  "oracle",
  "cockroachdb",
  "informix",
  "saphana",
  "sapase",
  "mariadb",
  "sqlserver",
  "db2",
];
const environments = ["prod", "staging", "test", "dev", "qa"];
const apps = [
  "app1",
  "app2",
  "app3",
  "finance",
  "hr",
  "inventory",
  "support",
  "legacy",
  "erp",
  "main",
  "backup",
  "marketing",
  "reports",
  "integration",
];
const datacenters = [
  "eu-west1",
  "us-west2",
  "eu-central1",
  "us-east1",
  "ap-south1",
  "eu-west2",
  "us-west1",
  "eu-north1",
  "us-central1",
  "ap-east1",
];
const customers = [
  "abc",
  "xyz",
  "fin1",
  "hr1",
  "inv1",
  "supp1",
  "leg1",
  "erp1",
  "test1",
  "bak1",
];
const statuses: InstanceStatus[] = [
  "healthy",
  "warning",
  "critical",
  "offline",
];

const generateRandomInstance = (id: number): Instance => ({
  id: `db${id + 9}`,
  name: `${getRandomElement([
    "Analytics",
    "Reporting",
    "Backup",
    "Archive",
    "Testing",
    "Production",
    "Development",
    "Staging",
    "Integration",
    "Legacy",
  ])} DB ${id + 9}`,
  status: getRandomElement(statuses),
  cpuUsage: getRandomInt(0, 100),
  diskIO: getRandomInt(0, 100),
  responseTime: getRandomInt(50, 500),
  alerts: getRandomInt(0, 5),
  changes: getRandomInt(0, 10),
  events: getRandomInt(0, 10),
  executions: getRandomInt(100, 1000000),
  totalTime: formatTotalTime(getRandomInt(2, 53165)),
  dbType: getRandomElement(dbTypes),
  tags: {
    env: getRandomElement(environments),
    app: getRandomElement(apps),
    dc: getRandomElement(datacenters),
    customer: getRandomElement(customers),
  },
});

const defaultInstances: Instance[] = [
  {
    id: "db1",
    name: "Production DB",
    status: "healthy",
    cpuUsage: 45,
    diskIO: 32,
    responseTime: 150,
    alerts: 0,
    changes: getRandomInt(0, 10),
    events: getRandomInt(0, 10),
    executions: getRandomInt(100, 1000000),
    totalTime: formatTotalTime(getRandomInt(2, 53165)),
    dbType: "postgresql",
    tags: {
      env: "prod",
      app: "app1",
      dc: "eu-west1",
      customer: "abc",
    },
  },
  {
    id: "db2",
    name: "Staging DB",
    status: "warning",
    cpuUsage: 78,
    diskIO: 65,
    responseTime: 250,
    alerts: 2,
    changes: getRandomInt(0, 10),
    events: getRandomInt(0, 10),
    executions: getRandomInt(100, 1000000),
    totalTime: formatTotalTime(getRandomInt(2, 53165)),
    dbType: "mysql",
    tags: {
      env: "staging",
      app: "app2",
      dc: "us-west2",
      customer: "xyz",
    },
  },
  {
    id: "db3",
    name: "Analytics DB",
    status: "critical",
    cpuUsage: 92,
    diskIO: 88,
    responseTime: 500,
    alerts: 3,
    changes: getRandomInt(0, 10),
    events: getRandomInt(0, 10),
    executions: getRandomInt(100, 1000000),
    totalTime: formatTotalTime(getRandomInt(2, 53165)),
    dbType: "cockroachdb",
    tags: {
      env: "prod",
      app: "analytics",
      dc: "us-east1",
      customer: "xyz",
    },
  },
  {
    id: "db4",
    name: "Testing DB",
    status: "healthy",
    cpuUsage: 25,
    diskIO: 15,
    responseTime: 100,
    alerts: 0,
    changes: getRandomInt(0, 10),
    events: getRandomInt(0, 10),
    executions: getRandomInt(100, 1000000),
    totalTime: formatTotalTime(getRandomInt(2, 53165)),
    dbType: "mariadb",
    tags: {
      env: "test",
      app: "app3",
      dc: "eu-central1",
      customer: "test1",
    },
  },
  {
    id: "db5",
    name: "Legacy System DB",
    status: "warning",
    cpuUsage: 65,
    diskIO: 45,
    responseTime: 300,
    alerts: 1,
    changes: getRandomInt(0, 10),
    events: getRandomInt(0, 10),
    executions: getRandomInt(100, 1000000),
    totalTime: formatTotalTime(getRandomInt(2, 53165)),
    dbType: "oracle",
    tags: {
      env: "prod",
      app: "legacy",
      dc: "us-west1",
      customer: "abc",
    },
  },
  {
    id: "db6",
    name: "Reporting DB",
    status: "offline",
    cpuUsage: 0,
    diskIO: 0,
    responseTime: 0,
    alerts: 5,
    changes: getRandomInt(0, 10),
    events: getRandomInt(0, 10),
    executions: getRandomInt(100, 1000000),
    totalTime: formatTotalTime(getRandomInt(2, 53165)),
    dbType: "sqlserver",
    tags: {
      env: "prod",
      app: "reports",
      dc: "ap-south1",
      customer: "xyz",
    },
  },
  {
    id: "db7",
    name: "Development DB",
    status: "healthy",
    cpuUsage: 35,
    diskIO: 28,
    responseTime: 120,
    alerts: 0,
    changes: getRandomInt(0, 10),
    events: getRandomInt(0, 10),
    executions: getRandomInt(100, 1000000),
    totalTime: formatTotalTime(getRandomInt(2, 53165)),
    dbType: "postgresql",
    tags: {
      env: "dev",
      app: "app1",
      dc: "eu-west2",
      customer: "abc",
    },
  },
  {
    id: "db8",
    name: "Integration DB",
    status: "healthy",
    cpuUsage: 42,
    diskIO: 30,
    responseTime: 180,
    alerts: 0,
    changes: getRandomInt(0, 10),
    events: getRandomInt(0, 10),
    executions: getRandomInt(100, 1000000),
    totalTime: formatTotalTime(getRandomInt(2, 53165)),
    dbType: "mysql",
    tags: {
      env: "staging",
      app: "integration",
      dc: "us-east2",
      customer: "xyz",
    },
  },
  ...Array.from({ length: 20 }, (_, i) => generateRandomInstance(i)),
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dbTypeFilter, setDbTypeFilter] = useState("all");
  const { preferences, updatePreference } = useViewPreferences();
  const [tagFilters, setTagFilters] = useState<TagFilter[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Initialize from URL params
  useEffect(() => {
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const dbType = searchParams.get("dbType");
    const tags = searchParams.get("tags");

    if (search) setSearchTerm(search);
    if (status) setStatusFilter(status);
    if (dbType) setDbTypeFilter(dbType);
    if (tags) {
      try {
        setTagFilters(JSON.parse(tags));
      } catch (e) {
        console.error("Invalid tags in URL", e);
      }
    }
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");

    if (statusFilter !== "all") params.set("status", statusFilter);
    else params.delete("status");

    if (dbTypeFilter !== "all") params.set("dbType", dbTypeFilter);
    else params.delete("dbType");

    if (tagFilters.length > 0) params.set("tags", JSON.stringify(tagFilters));
    else params.delete("tags");

    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, dbTypeFilter, tagFilters]);

  const filteredInstances = defaultInstances.filter((instance) => {
    const matchesSearch = instance.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || instance.status === statusFilter;
    const matchesDbType =
      dbTypeFilter === "all" || instance.dbType === dbTypeFilter;
    const matchesTags =
      tagFilters.length === 0 ||
      tagFilters.every(
        (filter) =>
          instance.tags[filter.key as keyof typeof instance.tags] ===
          filter.value,
      );
    return matchesSearch && matchesStatus && matchesDbType && matchesTags;
  });

  const handleInstanceClick = (instance: Instance) => {
    setSelectedInstance(instance);
    setIsDetailsOpen(true);
  };

  const handleSortChange = (field: string) => {
    if (field === preferences.sortBy) {
      updatePreference(
        "sortOrder",
        preferences.sortOrder === "asc" ? "desc" : "asc",
      );
    } else {
      updatePreference("sortBy", field as SortBy);
      updatePreference("sortOrder", "asc");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader
        onSearch={setSearchTerm}
        onStatusFilter={setStatusFilter}
        onDbTypeFilter={setDbTypeFilter}
        onTagFiltersChange={setTagFilters}
        instances={defaultInstances}
        filteredCount={filteredInstances.length}
        tagFilters={tagFilters}
      />
      <ViewControls
        layout={preferences.layout}
        groupBy={preferences.groupBy}
        sortBy={preferences.sortBy}
        sortOrder={preferences.sortOrder}
        onLayoutChange={(value) => updatePreference("layout", value)}
        onGroupByChange={(value) => updatePreference("groupBy", value)}
        onSortByChange={(value) => updatePreference("sortBy", value)}
        onSortOrderChange={(value) => updatePreference("sortOrder", value)}
        onSortChange={handleSortChange}
      />
      <div className="flex-1 overflow-hidden">
        <InstanceGrid
          instances={filteredInstances}
          layout={preferences.layout}
          groupBy={preferences.groupBy}
          sortBy={preferences.sortBy}
          sortOrder={preferences.sortOrder}
          onInstanceClick={handleInstanceClick}
          onSortChange={handleSortChange}
        />
      </div>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent
          side="right"
          className="!max-w-[100vw] w-[800px] sm:w-[1200px] lg:w-[1600px] p-0"
        >
          {selectedInstance && <InstanceDetails instance={selectedInstance} />}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Home;
