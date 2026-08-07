import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Referral OS" },
      {
        name: "description",
        content:
          "Configure your profile, outreach tone and follow-up automation for AI-generated referral messages.",
      },
      { property: "og:title", content: "Settings — Referral OS" },
      {
        property: "og:description",
        content: "Configure your profile, outreach tone and follow-up automation.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Page>
      <PageHeader title="Settings" description="Your profile shapes every message the assistant writes." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Your profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue="Alex Rivera" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="school">University</Label>
              <Input id="school" defaultValue="Ontario Tech University" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="program">Program &amp; grad year</Label>
              <Input id="program" defaultValue="BSc Computer Science · 2027" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pitch">One-line pitch</Label>
              <Textarea
                id="pitch"
                rows={3}
                defaultValue="Third-year CS student focused on backend and payments infrastructure."
              />
            </div>
            <Button size="sm" onClick={() => toast.success("Profile saved")}>
              Save profile
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Outreach preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Toggle
              label="Auto-research new candidates"
              hint="Run the research step as soon as a candidate is discovered."
              defaultChecked
            />
            <Separator className="my-3" />
            <Toggle
              label="Auto-draft messages"
              hint="Generate a first draft once research completes."
              defaultChecked
            />
            <Separator className="my-3" />
            <Toggle
              label="Follow-up reminders"
              hint="Remind me 5 days after a message goes unanswered."
              defaultChecked
            />
            <Separator className="my-3" />
            <Toggle
              label="Require manual approval before sending"
              hint="Nothing leaves the queue without your review."
              defaultChecked
            />
            <Separator className="my-3" />
            <Toggle
              label="Weekly analytics digest"
              hint="Email me a summary of response and referral rates."
            />
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}

function Toggle({
  label,
  hint,
  defaultChecked,
}: {
  label: string;
  hint: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch defaultChecked={defaultChecked} className="mt-0.5 shrink-0" />
    </div>
  );
}