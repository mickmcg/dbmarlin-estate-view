import React, { useState, useEffect } from "react";
import type { Instance, InstanceStatus } from "./dashboard/InstanceGrid";
import DashboardHeader from "./dashboard/DashboardHeader";
import ViewControls from "./dashboard/ViewControls";
import InstanceGrid from "./dashboard/InstanceGrid";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import InstanceDetails from "./dashboard/InstanceDetails";
import GroupDetails from "./dashboard/GroupDetails";
import { useViewPreferences } from "@/lib/hooks/useViewPreferences";
import { useSearchParams } from "react-router-dom";

const generateMockInstances = (count: number): Instance[] => {
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
  const statuses: InstanceStatus[] = [
    "healthy",
    "warning",
    "critical",
    "offline",
  ];
  const environments = ["prod", "staging", "dev", "test"];
  const apps = ["web", "mobile", "api", "analytics"];
  const datacenters = ["us-east", "us-west", "eu-central", "ap-south"];
  const customers = ["acme", "globex", "initech", "umbrella"];

  return Array.from({ length: count }, (_, i) => ({
    id: `instance-${i + 1}`,
    name: `db-${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    cpuUsage: Math.floor(Math.random() * 100),
    diskIO: Math.floor(Math.random() * 100),
    responseTime: Math.floor(Math.random() * 1000),
    alerts: Math.floor(Math.random() * 5),
    changes: Math.floor(Math.random() * 10),
    events: Math.floor(Math.random() * 20),
    executions: Math.floor(Math.random() * 10000),
    totalTime: `${Math.floor(Math.random() * 24)}h ${Math.floor(
      Math.random() * 60,
    )}m`,
    dbType: dbTypes[Math.floor(Math.random() * dbTypes.length)],
    tags: {
      env: environments[Math.floor(Math.random() * environments.length)],
      app: apps[Math.floor(Math.random() * apps.length)],
      dc: datacenters[Math.floor(Math.random() * datacenters.length)],
      customer: customers[Math.floor(Math.random() * customers.length)],
    },
  }));
};

const defaultInstances = generateMockInstances(50);

const Home = () => {
  const { preferences, updatePreference } = useViewPreferences();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dbTypeFilter, setDbTypeFilter] = useState<string>("all");
  const [tagFilters, setTagFilters] = useState<
    Array<{ key: string; value: string }>
  >([]);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
    null,
  );

  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{
    name: string;
    instances: Instance[];
  } | null>(null);

  const handleInstanceClick = (instance: Instance) => {
    setSelectedInstance(instance);
    setIsDetailsOpen(true);
  };

  const handleGroupClick = (groupName: string, instances: Instance[]) => {
    setSelectedGroup({ name: groupName, instances });
    setIsGroupDetailsOpen(true);
  };

  const handleSortChange = (field: string) => {
    if (field === preferences.sortBy) {
      updatePreference(
        "sortOrder",
        preferences.sortOrder === "asc" ? "desc" : "asc",
      );
    } else {
      updatePreference("sortBy", field);
      updatePreference("sortOrder", "asc");
    }
  };

  const filteredInstances = defaultInstances.filter((instance) => {
    // Search term filter
    if (
      searchTerm &&
      !instance.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && instance.status !== statusFilter) {
      return false;
    }

    // Database type filter
    if (dbTypeFilter !== "all" && instance.dbType !== dbTypeFilter) {
      return false;
    }

    // Tag filters
    if (
      tagFilters.length > 0 &&
      !tagFilters.every(
        (filter) =>
          instance.tags[filter.key as keyof typeof instance.tags] ===
          filter.value,
      )
    ) {
      return false;
    }

    return true;
  });

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
      <div className="flex-1 overflow-hidden min-w-0">
        <InstanceGrid
          instances={filteredInstances}
          layout={preferences.layout}
          groupBy={preferences.groupBy}
          sortBy={preferences.sortBy}
          sortOrder={preferences.sortOrder}
          onInstanceClick={handleInstanceClick}
          onGroupClick={handleGroupClick}
          onSortChange={handleSortChange}
        />
      </div>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent
          side="right"
          className="!max-w-[100vw] w-[800px] sm:w-[1200px] lg:w-[1600px] p-0"
        >
          <div className="border-b" />
          {selectedInstance && (
            <InstanceDetails
              instance={selectedInstance}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isGroupDetailsOpen} onOpenChange={setIsGroupDetailsOpen}>
        <SheetContent
          side="right"
          className="!max-w-[100vw] w-[800px] sm:w-[1200px] lg:w-[1600px] p-0"
        >
          <div className="border-b" />
          {selectedGroup && (
            <GroupDetails
              groupName={selectedGroup.name}
              instances={selectedGroup.instances}
              sortBy={preferences.sortBy}
              sortOrder={preferences.sortOrder}
              onSortChange={handleSortChange}
              onClose={() => setIsGroupDetailsOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Home;
