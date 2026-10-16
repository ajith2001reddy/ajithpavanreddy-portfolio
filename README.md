# Ajith Kambham — Data Engineering Portfolio

A responsive, static portfolio site. Recent non-fork, non-archived public repositories, their primary languages, and README summaries are fetched from the GitHub REST API when the page loads; the portfolio repository itself is excluded. No access token or build step is required.

## Run locally

From this folder, run:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Publish with GitHub Pages

1. Push the site files to the root of the `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/(root)`.
4. Save. GitHub Pages will publish the site at `https://ajith2001reddy.github.io/ajithpavanreddy-portfolio/`.

The projects and language highlights refresh on each visit. Their source is GitHub’s public repository API, so the featured list requires a network connection and may be temporarily unavailable if GitHub rate-limits a visitor. The page reports that condition and links to the GitHub profile.

Personal experience, education, and the core skills shown in `index.html` are based on the provided resume. Update those sections there when they change.
