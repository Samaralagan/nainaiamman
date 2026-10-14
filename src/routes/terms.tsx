import { createFileRoute } from "@tanstack/react-router";
import { TextPage } from "@/components/site/TextPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Jaffna Tamil Matrimony" },
      { name: "description", content: "Terms for using the Jaffna Tamil Matrimony service." },
      { property: "og:title", content: "Terms & Conditions — Jaffna Tamil Matrimony" },
      { property: "og:description", content: "Rules for members and visitors of our matrimony service." },
    ],
  }),
  component: () => (
    <TextPage title="Terms & Conditions">
      <p>Profiles are created and managed by the centre. Members must provide truthful information; changes are reviewed by the centre before publishing.</p>
      <p>Misuse of profile information, including sharing it outside the service, will result in account suspension.</p>
    </TextPage>
  ),
});
