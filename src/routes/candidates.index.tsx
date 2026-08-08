import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, MessageSquarePlus, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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
import { discoverCandidates, listCampaignCandidates, listCampaigns } from "@/lib/api";

export const Route = createFileRoute("/candidates/")({
  validateSearch: (search: Record<string, unknown>) => ({
    campaign: typeof search['campaign'] === "string" ? (search['campaign'] as string) : "all",
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
  const queryClient = useQueryClient();
  const campaignsQuery = useQuery({ queryKey: ["campaigns"], queryFn: listCampaigns });
  const candidatesQuery = useQuery({
    queryKey: ["campaign-candidates", campaignFilter],
    queryFn: () => listCampaignCandidates(campaignFilter),
    enabled: campaignFilter !== "all",
  });
  const discoverCandidatesMutation = useMutation({
    mutationFn: () => discoverCandidates(campaignFilter),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["campaign-candidates", campaignFilter] });
      if (result.candidates.length === 0) {
        window.alert("No public GitHub profiles were found for this company.");
      }
    },
  });

  const rows = (candidatesQuery.data ?? []).filter((c) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      c.full_name.toLowerCase().includes(q) ||
      (c.current_company ?? "").toLowerCase().includes(q) ||
      (c.current_role ?? "").toLowerCase().includes(q);
    return matchesQuery;
  });

  return (
    <Page>
      <PageHeader
        title="Candidate discovery"
        description={campaignFilter === "all" ? "Choose a campaign to view discovered candidates." : `${rows.length} discovered candidates in this campaign.`}
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
            {(campaignsQuery.data ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.company.name} · {c.target_role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {campaignFilter !== "all" ? (
        <Card className="flex items-center justify-between gap-4 shadow-none">
            <p className="text-sm text-muted-foreground">
              Searches public GitHub profiles for a self-reported association with the selected company.
            </p>
          <Button
            onClick={() => discoverCandidatesMutation.mutate()}
            disabled={discoverCandidatesMutation.isPending}
          >
              {discoverCandidatesMutation.isPending ? "Searching GitHub..." : "Find candidates"}
          </Button>
        </Card>
      ) : null}

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
              {candidatesQuery.isPending && campaignFilter !== "all" ? <TableRow><TableCell colSpan={7}>Loading candidates...</TableCell></TableRow> : null}
              {campaignFilter !== "all" && !candidatesQuery.isPending && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No public GitHub profiles found yet. Try another company or location.
                  </TableCell>
                </TableRow>
              ) : null}
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link
                      to="/candidates/$candidateId"
                      params={{ candidateId: c.id }}
                      className="hover:text-primary hover:underline"
                    >
                      {c.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.current_role ?? "Unknown role"} @ {c.current_company ?? "Unknown company"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.location ?? "Unknown"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Not scored</TableCell>
                  <TableCell>
                    <ul className="space-y-0.5 text-xs text-muted-foreground">
                        <li>Public GitHub profile</li>
                    </ul>
                  </TableCell>
                  <TableCell>
                    <StageBadge stage="discovered" />
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