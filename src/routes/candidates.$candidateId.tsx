import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  GraduationCap,
  MapPin,
  MessageSquarePlus,
  Sparkles,
} from "lucide-react";

import { MatchScore } from "@/components/match-score";
import { Page } from "@/components/page-shell";
import { StageBadge } from "@/components/stage-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { candidates, getCandidate } from "@/data/outreach";

export const Route = createFileRoute("/candidates/$candidateId")({
  loader: ({ params }) => {
    const candidate = getCandidate(params.candidateId);
    if (!candidate) throw notFound();
    return { candidate };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Candidate unavailable — Referral OS" }, { name: "robots", content: "noindex" }],
      };
    }
    const { candidate } = loaderData;
    const title = `${candidate.name} — Candidate Profile | Referral OS`;
    const description = `AI research summary and outreach angle for ${candidate.name}, ${candidate.role} at ${candidate.company}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CandidateDetail,
  notFoundComponent: CandidateMissing,
});

function CandidateMissing() {
  return (
    <Page>
      <h1 className="text-xl font-semibold">Candidate not found</h1>
      <Button asChild variant="outline" size="sm">
        <Link to="/candidates">Back to candidates</Link>
      </Button>
    </Page>
  );
}

function CandidateDetail() {
  const { candidate } = Route.useLoaderData();
  const related = candidates.filter(
    (c) => c.campaignId === candidate.campaignId && c.id !== candidate.id,
  );

  return (
    <Page>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 text-muted-foreground">
            <Link to="/candidates">
              <ArrowLeft className="size-4" />
              Candidates
            </Link>
          </Button>
          <h1 className="truncate text-2xl font-semibold">{candidate.name}</h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {candidate.role} @ {candidate.company}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StageBadge stage={candidate.stage} />
          <Button asChild size="sm">
            <Link to="/messages" search={{ candidate: candidate.id }}>
              <MessageSquarePlus className="size-4" />
              Generate message
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Candidate information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <InfoRow icon={Building2} label="Company" value={candidate.company} />
              <InfoRow icon={MapPin} label="Location" value={candidate.location} />
              <InfoRow
                icon={GraduationCap}
                label="Education"
                value={`${candidate.education} · ${candidate.gradYear}`}
              />

              <Separator />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Skills
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {candidate.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="border-0 font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Experience
                </p>
                <ul className="mt-3 space-y-3">
                  {candidate.experience.map((e) => (
                    <li key={`${e.title}-${e.period}`} className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0">
                        <p className="font-medium">{e.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.org} · {e.period}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Match score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MatchScore score={candidate.matchScore} size="lg" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Connection reasons
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {candidate.reasons.map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-base">AI research summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-relaxed text-muted-foreground">{candidate.research}</p>

              <div className="rounded-md border border-primary/25 bg-accent/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-accent-foreground">
                  Potential outreach angle
                </p>
                <p className="mt-2 text-sm leading-relaxed">&ldquo;{candidate.angle}&rdquo;</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/messages" search={{ candidate: candidate.id }}>
                    Review generated message
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={candidate.linkedin} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Open LinkedIn
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Others in this campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {related.length === 0 ? (
                <p className="text-sm text-muted-foreground">No other candidates yet.</p>
              ) : (
                related.map((c) => (
                  <Link
                    key={c.id}
                    to="/candidates/$candidateId"
                    params={{ candidateId: c.id }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.role} @ {c.company}
                      </p>
                    </div>
                    <MatchScore score={c.matchScore} />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}