import React, { useMemo } from "react";
import { Search, Tags } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TagFilter {
  key: string;
  value: string;
}

interface DashboardHeaderProps {
  onSearch?: (term: string) => void;
  onStatusFilter?: (status: string) => void;
  onDbTypeFilter?: (type: string) => void;
  onTagFiltersChange?: (filters: TagFilter[]) => void;
  filteredCount?: number;
  tagFilters?: TagFilter[];
  instances?: Array<{
    tags: {
      env: string;
      app: string;
      dc: string;
      customer: string;
    };
  }>;
}

const DashboardHeader = ({
  onSearch = () => {},
  onStatusFilter = () => {},
  onDbTypeFilter = () => {},
  onTagFiltersChange = () => {},
  tagFilters = [],
  instances = [],
  filteredCount = 0,
}: DashboardHeaderProps) => {
  const tagOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {
      env: new Set(),
      app: new Set(),
      dc: new Set(),
      customer: new Set(),
    };

    instances.forEach((instance) => {
      Object.entries(instance.tags).forEach(([key, value]) => {
        options[key].add(value);
      });
    });

    return Object.fromEntries(
      Object.entries(options).map(([key, values]) => [
        key,
        Array.from(values).sort(),
      ]),
    );
  }, [instances]);

  const addTagFilter = (key: string, value: string) => {
    const newFilters = [...tagFilters, { key, value }];
    onTagFiltersChange(newFilters);
  };

  const removeTagFilter = (key: string, value: string) => {
    const newFilters = tagFilters.filter(
      (f) => !(f.key === key && f.value === value),
    );
    onTagFiltersChange(newFilters);
  };

  return (
    <div className="w-full h-20 px-6 bg-background border-b flex items-center gap-4">
      {/* Instance Count */}
      <div className="text-sm text-muted-foreground">
        {filteredCount}/{instances.length} instances
      </div>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search instances..."
          className="pl-10"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Database Type Filter */}
      <Select defaultValue="all" onValueChange={onDbTypeFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Database Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="postgresql">PostgreSQL</SelectItem>
          <SelectItem value="mysql">MySQL</SelectItem>
          <SelectItem value="oracle">Oracle</SelectItem>
          <SelectItem value="cockroachdb">CockroachDB</SelectItem>
          <SelectItem value="informix">Informix</SelectItem>
          <SelectItem value="saphana">SAP HANA</SelectItem>
          <SelectItem value="sapase">SAP ASE</SelectItem>
          <SelectItem value="mariadb">MariaDB</SelectItem>
          <SelectItem value="sqlserver">SQL Server</SelectItem>
          <SelectItem value="db2">Db2</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select defaultValue="all" onValueChange={onStatusFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="healthy">Healthy</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="offline">Offline</SelectItem>
        </SelectContent>
      </Select>

      {/* Tag Filters */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Tags className="h-4 w-4" />
            Add Tag Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            {Object.entries(tagOptions).map(([key, values]) => (
              <div key={key} className="space-y-2">
                <h4 className="font-medium text-sm">{key}</h4>
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = tagFilters.some(
                      (f) => f.key === key && f.value === value,
                    );
                    return (
                      <Badge
                        key={value}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          isSelected
                            ? removeTagFilter(key, value)
                            : addTagFilter(key, value)
                        }
                      >
                        {value}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Tag Filters */}
      <div className="flex gap-2">
        {tagFilters.map((filter) => (
          <Badge
            key={`${filter.key}-${filter.value}`}
            variant="secondary"
            className="gap-2"
          >
            {filter.key}={filter.value}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default DashboardHeader;
