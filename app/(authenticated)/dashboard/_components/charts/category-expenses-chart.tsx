"use client";

import * as React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useBookings } from "@/hooks/use-bookings";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTags } from "@/hooks/use-tags";

export function CategoryExpensesChart() {
  const { data: bookingsData } = useBookings(null);
  const { data: tagsData } = useTags();

  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  // {tag: string, expenses: number}[]
  const chartData = React.useMemo(() => {
    if (!bookingsData || !tagsData) {
      return [];
    }

    // only inlcude bookings with a tag and expenses in the selected time range
    const filteredBookings = bookingsData
      .filter((booking) => booking.tagIds.length > 0 && booking.amount < 0)
      .filter((booking) => {
        const date = new Date(booking.date);
        const referenceDate = new Date();
        let daysToSubtract = 90;
        if (timeRange === "30d") {
          daysToSubtract = 30;
        } else if (timeRange === "7d") {
          daysToSubtract = 7;
        }
        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        return date >= startDate;
      });

    // Group by tagIds (each booking has multiple tags)
    // If a booking has multiple tags, it will be counted for each tag
    const tagExpenses: Record<string, number> = {};
    filteredBookings.forEach((booking) => {
      booking.tagIds.forEach((tagId) => {
        if (!tagExpenses[tagId]) {
          tagExpenses[tagId] = 0;
        }
        tagExpenses[tagId] += Math.abs(booking.amount);
      });
    });

    // Convert to array and include tag name
    return Object.entries(tagExpenses).map(([tagId, expenses]) => ({
      tag: tagsData.find((tag) => tag.id === tagId)?.name || "Unbekannt",
      expenses,
    }));
    // Sort by expenses descending
  }, [bookingsData, tagsData, timeRange]);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const chartConfig = {
    expenses: {
      label: "Ausgaben",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Ausgaben nach Kategorie</CardTitle>
        <CardDescription>
          Hier siehst du die Ausgaben nach Kategorie über den gewählten
          Zeitraum.
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Letzte 3 Monate</ToggleGroupItem>
            <ToggleGroupItem value="30d">Letzte 30 Tage</ToggleGroupItem>
            <ToggleGroupItem value="7d">Letzte 7 Tage</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Wert auswählen"
            >
              <SelectValue placeholder="Letzte 3 Monate" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Letzte 3 Monate
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Letze 30 Tage
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Letzte 7 Tage
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {chartData.length < 1 ? (
          <div className="text-center text-muted-foreground">
            Keine Daten für den gewählten Zeitraum vorhanden.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <RadarChart data={chartData}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarAngleAxis dataKey="tag" />
              <PolarGrid />
              <Radar
                dataKey="expenses"
                fill="var(--color-expenses)"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
