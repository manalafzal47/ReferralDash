import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, RefreshCw, Sparkles, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Page, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWarmLeads } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Referral OS" },
      {
        name: "description",
        content: "Find the strongest people in your network to ask for a referral.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const leadsQuery = useQuery({
    queryKey: ["warm-leads", "dashboard"],
    queryFn: () => getWarmLeads(),
  });
  const leads = leadsQuery.data?.leads ?? [];

  return (
    <Page>
      <PageHeader
        title="Find your strongest referral path"
        description="Import your network, choose a target, and start with the people most likely to help."
        actions={
          <Button asChild size="sm">
            <Link to="/warm-leads">
              <Sparkles className="size-4" />
              Find warm leads
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid size-11 place-items-center rounded-md bg-accent text-accent-foreground">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ranked warm leads</p>
              <p className="text-2xl font-semibold">{leads.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid size-11 place-items-center rounded-md bg-accent text-accent-foreground">
              <RefreshCw className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Network status</p>
              <p className="text-2xl font-semibold">{leadsQuery.isPending ? "Loading" : "Ready"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Your highest-fit connections</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Start with a personal, specific request.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/warm-leads">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {leadsQuery.isError ? (
            <p className="text-sm text-destructive">Could not load your network. Try again from Warm leads.</p>
          ) : leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No connections are ranked yet. Import your network to get started.</p>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead) => (
                <div key={`${lead.name}-${lead.company ?? "unknown"}`} className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{lead.role ?? "Connection"} · {lead.company ?? "Unknown company"}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-primary">{lead.match_score}%</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Page>
  );
}
