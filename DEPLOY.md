# AIgentum — GitHub Pages deployment

This is a static site. No Node/npm build is required.

## Required repository setting

Open repository **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

GitHub Pages must be available for the repository. On GitHub Free, Pages is available for public repositories; private repositories require a plan that supports private Pages.

## Workflow

The repository contains `.github/workflows/pages.yml` using GitHub's official Pages actions:

- `actions/checkout@v6`
- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v4`
- `actions/deploy-pages@v4`

Required permissions are declared in the workflow.

## If `Get Pages site failed: Not Found` appears

This is not an HTML/site build error. It means GitHub has not provisioned a Pages site for this repository, or the current repository/plan does not expose Pages to the workflow.

Check:

1. Settings → Pages → Source = GitHub Actions.
2. If the repository is private, confirm the GitHub plan supports Pages for private repositories, or make the repository public.
3. Then push a new commit or run the workflow manually.
