import { projects } from './data/content.js';

/* ------------------------------------------------------------------
   Routes — the case studies, and nothing else.

   A case study is an overlay over the index, not a second page, and
   it stays one: the URL is a name it wears while it is up, so that a
   project can be linked to, bookmarked and reopened. That is the
   whole routing problem here — one path segment, a fixed list of
   slugs, no nesting and no params — which is less than a router's
   config would cost to describe.

   Written by useOverlayPage (push on open, replace on paging, back on
   close); read here, once, at load.
   ------------------------------------------------------------------ */

export const projectPath = (slug) => `/${slug}`;

/* Which case study a path names, or null for the index. */
export function projectIndexFromPath(pathname = window.location.pathname) {
  const slug = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!slug) return null;
  const i = projects.findIndex((p) => p.slug === slug);
  return i === -1 ? null : i;
}

/* Anything we don't recognise — an old link, a typo, a crawler
   guessing at /projects — renders the index, so the address bar
   shouldn't be left claiming otherwise. Also settles a trailing
   slash onto the canonical form.

   replaceState, not push: there is nothing at the bad URL to go back
   to, and leaving it in the history would only give the reader a
   back button that lands nowhere. */
export function normalizePath() {
  const { pathname, search, hash } = window.location;
  const i = projectIndexFromPath(pathname);
  const canonical = i === null ? '/' : projectPath(projects[i].slug);
  if (pathname === canonical) return;
  history.replaceState(history.state, '', canonical + search + hash);
}
