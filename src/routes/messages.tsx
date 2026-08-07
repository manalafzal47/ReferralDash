import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, Pencil, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MatchScore } from "@/components/match-score";
import { Page, PageHeader } from "@/components/page-shell";
import { StageBadge } from "@/components/stage-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { candidates } from "@/data/outreach";

export const Route = createFileRoute("/messages")({
  validateSearch: (search: Record<string, unknown>) => ({
    candidate:
      typeof search["candidate"] === "string" ? (search["candidate"] as string) : "sarah-chen",
  }),
  head: () => ({
    meta: [
      { title: "Message Review — Referral OS" },
      {
        name: "description",
        content:
          "Review, edit and regenerate AI-personalized referral outreach messages before sending them.",
      },
      { property: "og:title", content: "Message Review — Referral OS" },
      {
        property: "og:description",
        content: "Review and edit AI-personalized referral outreach messages.",
      },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { candidate: candidateId } = Route.useSearch();
  const selected = candidates.find((c) => c.id === candidateId) ?? candidates[0]!;

  const [draft, setDraft] = useState(selected.message);
  const [editing, setEditing] = useState(false);
  const [channel, setChannel] = useState("linkedin");

  useEffect(() => {
    setDraft(selected.message);
    setEditing(false);
  }, [selected.message]);

  return (
    <Page>
      <PageHeader
        title="Message review"
        description="Every draft is generated from the research summary. Review before sending."
      />

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="h-fit p-0 shadow-none">
          <div className="border-b px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Queue · {candidates.length}
            </p>
          </div>
          <div className="max-h-[560px] overflow-y-auto p-2">
            {candidates.map((c) => (
              <Link
                key={c.id}
                to="/messages"
                search={{ candidate: c.id }}
                className={`block rounded-md px-3 py-2.5 transition-colors ${
                  c.id === selected.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"
                }`}
              >
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.role} @ {c.company}
                </p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 space-y-0">
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{selected.name}</CardTitle>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {selected.role} @ {selected.company} · {selected.location}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <MatchScore score={selected.matchScore} />
                <StageBadge stage={selected.stage} />
              </div>
            </div>
            <Tabs value={channel} onValueChange={setChannel} className="shrink-0">
              <TabsList>
                <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-md border border-primary/25 bg-accent/40 p-3">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent-foreground">
                <Sparkles className="size-3.5" />
                Angle used
              </p>
              <p className="mt-1.5 text-sm">{selected.angle}</p>
            </div>

            {channel === "email" ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Subject:</span>
                <Badge variant="secondary" className="border-0 font-normal">
                  Quick question from an Ontario Tech CS student
                </Badge>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Generated message
              </p>
              {editing ? (
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={14}
                  className="resize-none text-sm leading-relaxed"
                />
              ) : (
                <div className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
                  {draft}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {draft.length} characters · {draft.trim().split(/\s+/).length} words
              </p>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button
                variant={editing ? "default" : "outline"}
                size="sm"
                onClick={() => setEditing((v) => !v)}
              >
                <Pencil className="size-4" />
                {editing ? "Done editing" : "Edit"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft(selected.message);
                  toast.success("Message regenerated");
                }}
              >
                <RefreshCw className="size-4" />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard?.writeText(draft);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="size-4" />
                Copy message
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={selected.linkedin} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Open LinkedIn
                </a>
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  toast.success(`Marked as sent to ${selected.name}`, {
                    description: "Follow-up scheduled in 5 days.",
                  })
                }
              >
                <Check className="size-4" />
                Mark sent
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}