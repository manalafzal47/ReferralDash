import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Send, Sparkles, UserRoundPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getWarmLeads,
  importConnections,
  importLinkedInConnections,
  type ConnectionImportItem,
  type WarmLead,
} from "@/lib/api";

export const Route = createFileRoute("/warm-leads")({
  component: WarmLeadsPage,
});

const emptyConnectionDraft: ConnectionImportItem[] = [];

function WarmLeadsPage() {
  // The user can either paste a JSON array or import their live LinkedIn network.
  // A single state object keeps the ranking flow simple and makes the UI easier to reason about.
  const [rawConnections, setRawConnections] = useState<ConnectionImportItem[]>(emptyConnectionDraft);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<WarmLead[]>([]);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [company, setCompany] = useState("RBC");

  async function loadLeads() {
    setLoading(true);
    try {
      const response = await getWarmLeads({ target_role: targetRole, company });
      setLeads(response.leads);
    } catch (error) {
      console.error("Unable to load warm leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  async function handleImport() {
    if (!rawConnections.length) {
      return;
    }

    setLoading(true);
    try {
      await importConnections(rawConnections);
      await loadLeads();
    } catch (error) {
      console.error("Unable to import custom connections:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleImportFromLinkedIn() {
    setLoading(true);
    try {
      await importLinkedInConnections({
        company,
        target_role: targetRole,
        keywords: targetRole,
        limit: 10,
      });
      await loadLeads();
    } catch (error) {
      console.error("Unable to import LinkedIn data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Warm network</p>
          <h1 className="text-3xl font-semibold tracking-tight">Best people to ask for a referral</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleImportFromLinkedIn} className="gap-2" variant="secondary">
            <Sparkles className="size-4" />
            Load from LinkedIn
          </Button>
          <Button onClick={handleImport} className="gap-2" disabled={!rawConnections.length}>
            <UserRoundPlus className="size-4" />
            Import JSON
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          {loading ? (
            <Card className="shadow-none">
              <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Ranking your network...
              </CardContent>
            </Card>
          ) : leads.length === 0 ? (
            <Card className="shadow-none">
              <CardContent className="py-10 text-sm text-muted-foreground">
                No warm leads yet. Import a LinkedIn network or paste a JSON list of people to get started.
              </CardContent>
            </Card>
          ) : (
            leads.map((lead) => (
              <Card key={`${lead.name}-${lead.company ?? "unknown"}`} className="shadow-none">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{lead.name}</h3>
                        <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                          {lead.match_score}% fit
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lead.role ?? "Connection"} · {lead.company ?? "Unknown company"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Send className="size-4" />
                      Request intro
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-2 py-1">{lead.relationship ?? "Contact"}</span>
                    {lead.email ? <span className="rounded bg-muted px-2 py-1">{lead.email}</span> : null}
                  </div>

                  <p className="mt-4 text-sm text-foreground">{lead.reason}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="h-fit shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" />
              Smart connection filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-role">Target role</Label>
              <Input
                id="target-role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="RBC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="connections">LinkedIn or CSV-style data</Label>
              <Textarea
                id="connections"
                rows={12}
                placeholder={'Paste a JSON array of connections like [{"name":"Alex","company":"RBC","role":"Engineer"}]'}
                value={JSON.stringify(rawConnections, null, 2)}
                onChange={(e) => {
                  const text = e.target.value.trim();
                  if (!text) {
                    setRawConnections([]);
                    return;
                  }

                  try {
                    const parsed = JSON.parse(text);
                    if (Array.isArray(parsed)) {
                      setRawConnections(parsed as ConnectionImportItem[]);
                    }
                  } catch {
                    // Keep the textarea editable until the JSON is valid.
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={loadLeads} className="w-full" variant="secondary">
                Rank my leads
              </Button>
              <Button onClick={handleImportFromLinkedIn} className="w-full" variant="outline">
                LinkedIn import
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
