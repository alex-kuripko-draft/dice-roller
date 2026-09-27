# AGENTS.md — Dice Roller

Product mapped to Epic **CP-6** on https://testing-alex.atlassian.net. Read the Jira issue,
the Confluence Project Context page and this file before any work.

## Delivery contract (Buzz coordinator)

- Branch from `develop`: `feature/CP-<n>-<slug>`; design
  prototypes on `design/CP-6-<slug>` with the PR label `design-review`.
  Put the Jira key in the branch name and PR title. PRs target `develop`.
- `main` and `develop` are protected: changes only through PRs.
- Every deployment, whatever the platform, must end by recording a GitHub
  deployment for the exact commit with the local action
  `.github/actions/record-deployment` using environment names
  `dev` (dev) and `production` (production). The coordinator verifies
  "deployed to dev before QA" and releases only through these records.
- Production deploys run only for an owner-authorized `[delivery-operation]`
  of kind `release`, for the exact artifact in its scope.

## Stack and deployment

Decided with Alex and recorded in the Project Context page:

- Stack: plain HTML, CSS and JavaScript in `src/`, without a build step or runtime dependencies. Tests use Node's built-in test runner: `npm test` (`node --test`).
- CI: `.github/workflows/ci.yml` runs on pull requests and pushes, with a manual SHA fallback that publishes commit status `test`. Both protected branches require `test`.
- Both environments are real, browsable GitHub Pages URLs sharing one site: production at https://alex-kuripko-draft.github.io/dice-roller/ (root) and dev at https://alex-kuripko-draft.github.io/dice-roller/dev/. Each deploy republishes the other environment's last successful commit alongside its own (`.github/actions/publish-pages`), so neither overwrites the other.
- Dev deployment: `.github/workflows/deploy-dev.yml` tests, smoke-checks and publishes every `develop` push to `/dev/`, then records a `dev` deployment of that commit with that URL.
- Production deployment: `.github/workflows/deploy-production.yml` manually deploys an exact `main` commit to the Pages root and records it as `production`. Only DevOps runs this for an authorized release operation.
- No deployment secrets are required.

## GitHub Actions on this account

Push and pull_request events normally start CI and the dev deployment. They
were unavailable on this account for a while, so every workflow also keeps a
`workflow_dispatch` trigger as a fallback. When a PR shows no CI run, or the
required `test` check stays "Expected":

1. start CI for the PR head commit from `develop`:
   `gh workflow run <ci-workflow> --ref develop -f sha=<full 40-hex head sha>`.
   Checks of manual runs are not part of a PR's status rollup, so the CI
   workflow must publish the commit status `test` on that commit (see the
   `report` job in the tip-split CI for the pattern);
2. after merging into `develop`, if no dev deployment started, run
   `gh workflow run <dev-deploy-workflow> --ref develop`, then confirm the
   `dev` deployment for that exact SHA succeeded.

Renaming a PR's head branch closes the PR; open a new PR instead.
