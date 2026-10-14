<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public member data is read through server functions in src/lib/members.functions.ts using a publishable-key client, so pages render on the server and private columns stay out.
- Shortlists and photo/contact requests are written from the browser client under row-level rules scoped to the signed-in user.
- User accounts are created only by admins via server functions in src/lib/users.functions.ts (public signup disabled); login uses a username mapped to an internal email in src/lib/username.ts, because the auth system requires an email.
- Use the shared YathakamChart renderer for public and editable charts so both views keep the same cell positions and presentation.
