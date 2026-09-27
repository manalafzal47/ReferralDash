import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";

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
  const userQuery = useQuery({ queryKey: ["current-user"], queryFn: getCurrentUser });
  const user = userQuery.data;

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
              <Input id="name" value={user?.name ?? ""} readOnly placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} readOnly placeholder="Your email" />
            </div>
              <p className="text-xs text-muted-foreground">Profile editing has been removed.</p>
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
              defaultChecked={false}
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
  readonly label: string;
  readonly hint: string;
  readonly defaultChecked?: boolean | undefined;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch defaultChecked={defaultChecked ?? false} className="mt-0.5 shrink-0" />
    </div>
  );
}