import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare, Percent, TrendingUp, UserCheck } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Page, PageHeader } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { campaignPerformance, connectionTypes, messagesOverTime } from "@/data/outreach";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Outreach Analytics — Referral OS" },
      {
        name: "description",
        content:
          "Measure response rate, referral conversion and which connection types actually get replies.",
      },
      { property: "og:title", content: "Outreach Analytics — Referral OS" },
      {
        property: "og:description",
        content: "Response rate, referral conversion and best-performing connection types.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--popover-foreground)",
};

function AnalyticsPage() {
  return (
    <Page>
      <PageHeader
        title="Analytics"
        description="What's working across every campaign, and where the pipeline leaks."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Response rate" value="24.6%" delta="+3.1 pts vs last month" icon={Percent} tone="positive" />
        <StatCard label="Referral conversion" value="12.5%" delta="+1.4 pts vs last month" icon={UserCheck} tone="positive" />
        <StatCard label="Messages sent" value="278" delta="46 this week" icon={MessagesSquare} />
        <StatCard label="Avg. reply time" value="2.4d" delta="Fastest: same-university" icon={TrendingUp} />
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Messages sent over time</CardTitle>
          <p className="text-sm text-muted-foreground">Weekly outreach volume and replies received.</p>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={messagesOverTime} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="sentFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" {...axis} />
                <YAxis {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#sentFill)"
                />
                <Area
                  type="monotone"
                  dataKey="replies"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Best performing campaigns</CardTitle>
            <p className="text-sm text-muted-foreground">Response rate by company.</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformance} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" {...axis} />
                  <YAxis {...axis} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="responseRate" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Best connection types</CardTitle>
            <p className="text-sm text-muted-foreground">Reply rate by why you were matched.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectionTypes.map((c) => (
              <div key={c.type}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{c.type}</span>
                  <span className="num font-medium">{c.rate}%</span>
                </div>
                <Progress value={c.rate * 2.5} className="mt-2 h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}