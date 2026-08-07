<<<<<<< keep
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, MessageSquarePlus, Sparkles } from "lucide-react";
import { useState } from "react";

import { MatchScore } from "@/components/match-score";
import { Page, PageHeader } from "@/components/page-shell";
import { StageBadge } from "@/components/stage-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { campaigns, candidates } from "@/data/outreach";

export const Route = createFileRoute("/candidates")({
  validateSearch: (search: Record<string, unknown>) => ({
    campaign: typeof search.campaign === "string" ? search.campaign : "all",
  }),
  head: () => ({
    meta: [
      { title: "Candidate Discovery — Referral OS" },
      {
        name: "description",
        content:
          "Review AI-matched referral candidates with match scores and connection reasons before reaching out.",
      },
      { property: "og:title", content: "Candidate Discovery — Referral OS" },
      {
        property: "og:description",
        content: "AI-matched referral candidates with match scores and connection reasons.",
      },
    ],
  }),
  component: CandidatesPage,
});

function CandidatesPage() {
  const { campaign } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState(campaign);

  const rows = candidates.filter((c) => {
    const matchesCampaign = campaignFilter === "all" || c.campaignId === campaignFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q);
    return matchesCampaign && matchesQuery;
  });

  return (
    <Page>
      <PageHeader
        title="Candidate discovery"
        description={`${rows.length} people matched across your active campaigns.`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, company or role"
          className="sm:max-w-xs"
        />
        <Select value={campaignFilter} onValueChange={setCampaignFilter}>
          <SelectTrigger className="sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campaigns</SelectItem>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden p-0 shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-44">Name</TableHead>
                <TableHead className="min-w-48">Company &amp; role</TableHead>
                <TableHead className="min-w-32">Location</TableHead>
                <TableHead className="min-w-28">Match</TableHead>
                <TableHead className="min-w-64">Connection reason</TableHead>
                <TableHead className="min-w-28">Status</TableHead>
                <TableHead className="min-w-56 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link
                      to="/candidates/$candidateId"
                      params={{ candidateId: c.id }}
                      className="hover:text-primary hover:underline"
                    >
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.role} @ {c.company}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.location}</TableCell>
                  <TableCell>
                    <MatchScore score={c.matchScore} />
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-0.5 text-xs text-muted-foreground">
                      {c.reasons.map((r) => (
                        <li key={r} className="flex items-start gap-1.5">
                          <span className="text-success">✓</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={c.stage} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/candidates/$candidateId" params={{ candidateId: c.id }}>
                          <Eye className="size-4" />
                          View
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/candidates/$candidateId" params={{ candidateId: c.id }}>
                          <Sparkles className="size-4" />
                          Research
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/messages" search={{ candidate: c.id }}>
                          <MessageSquarePlus className="size-4" />
                          Message
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </Page>
  );
}