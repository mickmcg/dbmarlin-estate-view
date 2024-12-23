import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutGrid,
  List,
  Server,
  Heart,
  SortAsc,
  SortDesc,
  Grid,
  Database,
  Tags,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewLayout = "compact" | "comfortable" | "list";
type GroupBy = "none" | "server" | "health" | "dbType" | string;
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

const TAG_KEYS = ["env", "app", "dc", "customer"];

interface ViewControlsProps {
  layout?: ViewLayout;
  groupBy?: GroupBy;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  onLayoutChange?: (layout: ViewLayout) => void;
  onGroupByChange?: (groupBy: GroupBy) => void;
  onSortByChange?: (sortBy: SortBy) => void;
  onSortOrderChange?: (order: SortOrder) => void;
  onSortChange?: (field: string) => void;
}

const ViewControls = ({
  layout = "comfortable",
  groupBy = "none",
  sortBy = "name",
  sortOrder = "asc",
  onLayoutChange = () => {},
  onGroupByChange = () => {},
  onSortByChange = () => {},
  onSortOrderChange = () => {},
  onSortChange = () => {},
}: ViewControlsProps) => {
  return (
    <div className="w-full h-[60px] px-4 border-b bg-background flex items-center justify-between">
      {/* Layout Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
          <Button
            variant={layout === "compact" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onLayoutChange("compact")}
            className="h-8"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Compact
          </Button>
          <Button
            variant={layout === "comfortable" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onLayoutChange("comfortable")}
            className="h-8"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Comfortable
          </Button>
          <Button
            variant={layout === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onLayoutChange("list")}
            className="h-8"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Group and Sort Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Group by:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-between">
                {groupBy === "none" && "Ungrouped"}
                {groupBy === "dbType" && "Database Type"}
                {groupBy === "server" && "Server"}
                {groupBy === "health" && "Health"}
                {groupBy.startsWith("tag:") && `By ${groupBy.split(":")[1]}`}
                <Grid className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onGroupByChange("none")}>
                <div className="flex items-center">
                  <Grid className="h-4 w-4 mr-2" />
                  Ungrouped
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGroupByChange("dbType")}>
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Database Type
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGroupByChange("server")}>
                <div className="flex items-center">
                  <Server className="h-4 w-4 mr-2" />
                  Server
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGroupByChange("health")}>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Health
                </div>
              </DropdownMenuItem>
              {TAG_KEYS.map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onGroupByChange(`tag:${key}`)}
                >
                  <div className="flex items-center">
                    <Tags className="h-4 w-4 mr-2" />
                    By {key}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(value: SortBy) => onSortChange(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="dbType">Database Type</SelectItem>
              <SelectItem value="changes">Changes</SelectItem>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="totalTime">Total Time</SelectItem>
              <SelectItem value="executions">Executions</SelectItem>
              <SelectItem value="responseTime">Avg Response</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
            }
            className="hover:bg-transparent hover:text-primary"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewControls;
