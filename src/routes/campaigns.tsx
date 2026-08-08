import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Page, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCampaign, listCampaigns, type CreateCampaignInput } from "@/lib/api";

export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaigns — Referral OS" },
      {
        name: "description",
        content:
          "Create and manage AI-powered referral outreach campaigns for internships and new grad roles.",
      },
      { property: "og:title", content: "Campaigns — Referral OS" },
      {
        property: "og:description",
        content: "Create and manage AI-powered referral outreach campaigns.",
      },
    ],
  }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const queryClient = useQueryClient();
  const campaignsQuery = useQuery({ queryKey: ["campaigns"], queryFn: listCampaigns });
  const createCampaignMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created");
    },
    onError: (error) => toast.error("Could not create campaign", { description: error.message }),
  });

  const campaigns = campaignsQuery.data ?? [];

  return (
    <Page>
      <PageHeader
        title="Campaigns"
        description="Each campaign targets one role at one company and tracks every referral conversation."
        actions={
          <Button variant="outline" size="sm">
            <Plus className="size-4" />
            New campaign
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3">
          {campaignsQuery.isPending ? (
            <p className="text-sm text-muted-foreground">Loading campaigns...</p>
          ) : null}
          {campaignsQuery.isError ? (
            <p className="text-sm text-destructive">
              Could not load campaigns: {campaignsQuery.error.message}
            </p>
          ) : null}
          {campaigns.map((c) => (
            <Card key={c.id} className="shadow-none transition-colors hover:border-primary/40">
              <CardContent className="p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold">{c.company.name}</h3>
                      <Badge
                        variant="secondary"
                        className="border-0 bg-accent text-accent-foreground capitalize"
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {c.target_role} · {c.location ?? "No location"} · started{" "}
                      {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="shrink-0">
                    <Link to="/candidates" search={{ campaign: c.id }}>
                      Open
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    ["Candidates", 0],
                    ["Contacted", 0],
                    ["Replies", 0],
                    ["Referral conversations", 0],
                  ].map(([label, value]) => (
                    <div key={label as string} className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">{label}</p>
                      <p className="num mt-1 text-lg font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Progress value={0} className="h-1.5" />
                  <p className="mt-2 text-xs text-muted-foreground">No candidates discovered yet</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit shadow-none lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="text-base">Create new outreach campaign</CardTitle>
            <p className="text-sm text-muted-foreground">
              We&apos;ll search for people who can realistically refer you.
            </p>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const input: CreateCampaignInput = {
                  company_name: formString(form, "company"),
                  target_role: formString(form, "role"),
                  contact_goal: Number(form.get("count") ?? 50),
                  keywords: formString(form, "keywords")
                    .split(",")
                    .map((keyword) => keyword.trim())
                    .filter(Boolean),
                };
                const location = formString(form, "location");
                const jobPostingUrl = formString(form, "jobUrl");
                const seniority = formString(form, "seniority");
                const preferredBackground = formString(form, "background");
                if (location) input.location = location;
                if (jobPostingUrl) input.job_posting_url = jobPostingUrl;
                if (seniority) input.seniority = seniority;
                if (preferredBackground) input.preferred_background = preferredBackground;
                createCampaignMutation.mutate(input);
              }}
            >
              <Field id="company" label="Company" placeholder="RBC" />
              <Field id="role" label="Role" placeholder="Software Engineer Intern" />
              <Field id="location" label="Location" placeholder="Toronto, ON" />
              <Field id="jobUrl" label="Job URL" placeholder="https://jobs.rbc.com/..." />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="count">People to find</Label>
                  <Input id="count" name="count" type="number" defaultValue={50} min={1} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seniority">Seniority</Label>
                  <Select defaultValue="mid" name="seniority">
                    <SelectTrigger id="seniority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior / New grad</SelectItem>
                      <SelectItem value="mid">Mid-level</SelectItem>
                      <SelectItem value="senior">Senior / Staff</SelectItem>
                      <SelectItem value="manager">Manager+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="background">Preferred background</Label>
                <Select defaultValue="alumni" name="background">
                  <SelectTrigger id="background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alumni">Same university alumni</SelectItem>
                    <SelectItem value="city">Same city</SelectItem>
                    <SelectItem value="path">Similar career path</SelectItem>
                    <SelectItem value="any">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="keywords">Keywords</Label>
                <Textarea
                  id="keywords"
                  name="keywords"
                  rows={3}
                  placeholder="payments, distributed systems, Ontario Tech, co-op mentor"
                />
              </div>

              <Button type="submit" className="w-full" disabled={createCampaignMutation.isPending}>
                <Search className="size-4" />
                {createCampaignMutation.isPending ? "Creating campaign..." : "Create campaign"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}

function Field({
  id,
  label,
  placeholder,
}: {
  readonly id: string;
  readonly label: string;
  readonly placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} placeholder={placeholder} />
    </div>
  );
}

function formString(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}
