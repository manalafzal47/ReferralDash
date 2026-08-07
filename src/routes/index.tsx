import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  MessagesSquare,
  Percent,
  Plus,
  Target,
  UserCheck,
  Users,
} from "lucide-react";

import { MatchScore } from "@/components/match-score";
import { Page, PageHeader } from "@/components/page-shell";
import { StageBadge } from "@/components/stage-badge";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { campaigns, candidates } from "@/data/outreach";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Referral OS — AI Job Outreach Dashboard" },
      {
        name: "description",
        content:
          "Find referrals, research them, generate personalized outreach and track every reply — one AI career operating system for students.",
      },
      { property: "og:title", content: "Referral OS — AI Job Outreach Dashboard" },
      {
        property: "og:description",
        content:
          "Find referrals, research them, generate personalized outreach and track every reply.",
      },
    ],
  }),
  component: Dashboard,
});

const totals = campaigns.reduce(
  (acc, c) => ({
    candidates: acc.candidates + c.candidates,
    contacted: acc.contacted + c.contacted,
    replies: acc.replies + c.replies,
    referrals: acc.referrals + c.referrals,
  }),
  { candidates: 0, contacted: 0, replies: 0, referrals: 0 },
);

function Dashboard() {
  const attention = candidates
    .filter((c) => ["ready", "replied", "referral", "interview"].includes(c.stage))
    .slice(0, 5);

  return (
    <Page>
      <PageHeader
        title="Good afternoon, Alex"
        description="Five conversations need you today. Here's where every campaign stands."
        actions={
          <Button asChild size="sm">
            <Link to="/campaigns">
              <Plus className="size-4" />
              New campaign
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Active campaigns"
          value={campaigns.filter((c) => c.status === "active").length}
          delta="1 paused"
          icon={Target}
        />
        <StatCard label="Total candidates" value={totals.candidates} delta="+12 this week" icon={Users} />
        <StatCard
          label="Messages sent"
          value={totals.contacted}
          delta="46 this week"
          icon={MessagesSquare}
        />
        <StatCard
          label="Response rate"
          value={`${Math.round((totals.replies / totals.contacted) * 100)}%`}
          delta="+3.1 pts"
          icon={Percent}
          tone="positive"
        />
        <StatCard label="Referrals" value={totals.referrals} delta="2 pending resume" icon={UserCheck} tone="positive" />
        <StatCard label="Interviews" value={1} delta="NVIDIA · Aug 11" icon={CalendarCheck} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="shadow-none">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 space-y-0">
            <CardTitle className="text-base">Campaign performance</CardTitle>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to="/campaigns">
                All campaigns
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {campaigns.map((c) => (
              <div key={c.id}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <span className="num shrink-0 text-xs text-muted-foreground">
                    {c.replies}/{c.contacted} replied
                  </span>
                </div>
                <Progress value={(c.contacted / c.candidates) * 100} className="mt-2 h-1.5" />
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Candidates <span className="num text-foreground">{c.candidates}</span>
                  </span>
                  <span>
                    Contacted <span className="num text-foreground">{c.contacted}</span>
                  </span>
                  <span>
                    Replies <span className="num text-foreground">{c.replies}</span>
                  </span>
                  <span>
                    Referral conversations{" "}
                    <span className="num text-foreground">{c.referrals}</span>
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 space-y-0">
            <CardTitle className="text-base">Needs your attention</CardTitle>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to="/follow-ups">
                Pipeline
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {attention.map((c) => (
              <Link
                key={c.id}
                to="/candidates/$candidateId"
                params={{ candidateId: c.id }}
                className="block rounded-md border p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.role} @ {c.company}
                    </p>
                  </div>
                  <MatchScore score={c.matchScore} />
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted-foreground">{c.nextAction}</span>
                  <StageBadge stage={c.stage} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
