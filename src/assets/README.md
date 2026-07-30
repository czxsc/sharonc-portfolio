# Assets

Folders follow the site, not the file type — a project's images sit under
its slug, a hobby's under its slug, so `content.js` and this tree read the
same way.

```
site/       nav mark, hero portrait, hero loop, the drawn cursor
play/       the shelf objects on the home page + cat_push_bag/ frames
projects/   one folder per project slug (Work → ProjectPage)
              artificer  dishcovery  little-wonder  pokeleet
              portfolio  preflight
hobby/      one folder per hobby slug (Play → HobbyPage)
              drinks  gaming  music/concerts  stories/{books,shows}
_source/    masters — never imported
```

Every file outside `_source/` is imported by something; nothing here is
dead weight. Each project's lead image is `cover.*`.

## `_source/`

Full-resolution originals, mirroring the structure above, kept so art can
be re-exported at a different size later. Vite never sees them.

The Little Wonder masters (`_source/projects/little-wonder/`) run 2–17 MB
each, ~80 MB total, and are **gitignored** — they exist only on disk and in
cloud storage, so don't delete them expecting git to have a copy. They are
re-exported by `scripts/export-little-wonder-web.py`, which walks the two
trees by the same relative path.

`_source/projects/preflight/ref/` is reference material rather than masters:
the CUAIR screenshots and the layout reference some `ProjectPage.css`
comments point at.
