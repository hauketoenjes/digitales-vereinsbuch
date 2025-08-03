"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
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
import { useAccounts } from "@/hooks/use-accounts";
import { useBookings } from "@/hooks/use-bookings";
import { useIsMobile } from "@/hooks/use-mobile";

export function BalanceHistoryChart() {
  const { data: bookingsData } = useBookings(null);
  const { data: accountsData } = useAccounts();

  const chartData = React.useMemo(() => {
    if (!bookingsData || !accountsData) {
      return [];
    }
    // Build a map of date to aggregated account balances
    const dataMap: Record<string, Record<string, number>> = {};
    bookingsData.forEach((booking) => {
      const { date, accountId, amount } = booking;
      if (!dataMap[date]) {
        dataMap[date] = accountsData.reduce(
          (acc, account) => ({ ...acc, [account.id]: 0 }),
          {} as Record<string, number>
        );
      }
      dataMap[date][accountId] = (dataMap[date][accountId] || 0) + amount;
    });
    // Convert to array and include date
    const result = Object.entries(dataMap).map(([date, accounts]) => ({
      date,
      ...accounts,
    })) as Record<string, string | number>[];
    // Sort by date ascending
    result.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    // Compute cumulative balances per account
    const runningTotals: Record<string, number> = accountsData.reduce(
      (acc, account) => ({ ...acc, [account.id]: 0 }),
      {} as Record<string, number>
    );
    result.forEach((row) => {
      accountsData.forEach((account) => {
        const id = account.id;
        runningTotals[id] += row[id] as number;
        row[id] = runningTotals[id];
      });
    });
    return result;
  }, [bookingsData, accountsData]);

  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
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

  const chartConfig: ChartConfig = React.useMemo(() => {
    if (!accountsData) {
      return {};
    }
    return accountsData.reduce((config, account, idx) => {
      config[account.id] = {
        label: account.name,
        // Assign colors from CSS variables in sequence
        color: `var(--chart-${idx + 1})`,
      };
      return config;
    }, {} as ChartConfig);
  }, [accountsData]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Saldo nach Konten</CardTitle>
        <CardDescription>
          Hier siehst du die Entwicklung deines Saldos nach Konten über den
          gewählten Zeitraum.
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
        {filteredData.length < 1 ? (
          <div className="text-center text-muted-foreground">
            Keine Daten für den gewählten Zeitraum vorhanden.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart data={filteredData} margin={{ left: 40 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                tickFormatter={(value) =>
                  value.toLocaleString(undefined, {
                    style: "currency",
                    currency: "EUR",
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : 10}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                }
              />
              {accountsData?.map((account, idx) => (
                <Line
                  key={account.id}
                  dataKey={account.id}
                  type="monotone"
                  stroke={`var(--chart-${idx + 1})`}
                  dot={false}
                />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
