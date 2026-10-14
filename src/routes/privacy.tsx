import { createFileRoute } from "@tanstack/react-router";
import { TextPage } from "@/components/site/TextPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Jaffna Tamil Matrimony" },
      { name: "description", content: "How we protect member photos, phone numbers and personal details." },
      { property: "og:title", content: "Privacy Policy — Jaffna Tamil Matrimony" },
      { property: "og:description", content: "Our commitment to member privacy." },
    ],
  }),
  component: () => (
    <TextPage title="Privacy Policy">
      <p>Member photos and phone numbers are never shown publicly. They are shared only after a request is reviewed and approved by the centre.</p>
      <p>Personal information is used solely for matchmaking and is never sold. Members may ask us to update or remove their profile at any time.</p>
    </TextPage>
  ),
});
