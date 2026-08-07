import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Search } from "lucide-react";
import { toast } from "sonner";

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
import { campaigns } from "@/data/outreach";

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
          {campaigns.map((c) => (
            <Card key={c.id} className="shadow-none transition-colors hover:border-primary/40">
              <CardContent className="p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold">{c.name}</h3>
                      <Badge
                        variant="secondary"
                        className="border-0 bg-accent text-accent-foreground capitalize"
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {c.role} · {c.location} · started {c.createdAt}
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
                    ["Candidates", c.candidates],
                    ["Contacted", c.contacted],
                    ["Replies", c.replies],
                    ["Referral conversations", c.referrals],
                  ].map(([label, value]) => (
                    <div key={label as string} className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">{label}</p>
                      <p className="num mt-1 text-lg font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Progress value={(c.contacted / c.candidates) * 100} className="h-1.5" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {Math.round((c.contacted / c.candidates) * 100)}% of discovered candidates
                    contacted
                  </p>
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
                toast.success("Searching for candidates", {
                  description: "We'll notify you when the shortlist is ready.",
                });
              }}
            >
              <Field id="company" label="Company" placeholder="RBC" />
              <Field id="role" label="Role" placeholder="Software Engineer Intern" />
              <Field id="location" label="Location" placeholder="Toronto, ON" />
              <Field id="jobUrl" label="Job URL" placeholder="https://jobs.rbc.com/..." />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="count">People to find</Label>
                  <Input id="count" type="number" defaultValue={50} min={1} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seniority">Seniority</Label>
                  <Select defaultValue="mid">
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
                <Select defaultValue="alumni">
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
                  rows={3}
                  placeholder="payments, distributed systems, Ontario Tech, co-op mentor"
                />
              </div>

              <Button type="submit" className="w-full">
                <Search className="size-4" />
                Find candidates
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
  id: string;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} placeholder={placeholder} />
    </div>
  );
}