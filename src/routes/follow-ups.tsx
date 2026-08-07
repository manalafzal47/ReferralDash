import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { MatchScore } from "@/components/match-score";
import { Page, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { candidates, STAGES } from "@/data/outreach";

export const Route = createFileRoute("/follow-ups")({
  head: () => ({
    meta: [
      { title: "Outreach CRM — Referral OS" },
      {
        name: "description",
        content:
          "Track every referral conversation from discovery to interview on a single outreach pipeline board.",
      },
      { property: "og:title", content: "Outreach CRM — Referral OS" },
      {
        property: "og:description",
        content: "Track referral conversations from discovery to interview.",
      },
    ],
  }),
  component: FollowUpsPage,
});

function FollowUpsPage() {
  return (
    <Page>
      <PageHeader
        title="Outreach pipeline"
        description="Every conversation, from first match to interview. Drag-free — stages update as you act."
      />

      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-max gap-4">
          {STAGES.map((stage) => {
            const items = candidates.filter((c) => c.stage === stage.id);
            return (
              <section key={stage.id} className="w-72 shrink-0">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold">{stage.label}</h2>
                  <span className="num rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2 rounded-lg bg-muted/40 p-2">
                  {items.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                      No candidates
                    </p>
                  ) : (
                    items.map((c) => (
                      <Link
                        key={c.id}
                        to="/candidates/$candidateId"
                        params={{ candidateId: c.id }}
                        className="block"
                      >
                        <Card className="gap-0 p-3 shadow-none transition-colors hover:border-primary/40">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{c.name}</p>
                              <p className="truncate text-xs text-muted-foreground">{c.company}</p>
                            </div>
                            <MatchScore score={c.matchScore} />
                          </div>

                          <div className="mt-3 space-y-1.5 border-t pt-2.5 text-xs text-muted-foreground">
                            <p className="flex items-center gap-1.5">
                              <Clock className="size-3.5 shrink-0" />
                              {c.lastContacted
                                ? `Contacted ${c.lastContacted}`
                                : "Not contacted yet"}
                            </p>
                            <p className="truncate font-medium text-foreground">{c.nextAction}</p>
                          </div>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </Page>
  );
}