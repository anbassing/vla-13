# Visit Locals Insight Article Directory

This folder is the canonical editorial source for Insight articles. Every published article lives in its own directory under `/insight/articles/<slug>/index.html`.

## Adding a future article
1. Create a slug folder.
2. Add `index.html` using the shared Visit Locals shell.
3. Add the article card to `/insight/articles/index.html` with `data-search-item="true"`.
4. If the article should be featured on the Insight homepage, add its link to `/insight/index.html`.
5. Keep research sources at the bottom of the article.

The Insight homepage search fetches the archive index at runtime and merges those article records with Visit Locals services, journeys and destination guides.
