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

Decided with the owner and recorded in the Project Context page, then here:

- Stack: _to be decided_
- CI: _to be decided_ (must expose a check that PRs require)
- Dev deployment: _to be decided_
- Production deployment: _to be decided_

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
