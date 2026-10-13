# VTK-History Technical Report

## Purpose

Maintaining VTK depends on knowledge recorded in its development history: why code is written the way it is, what was tried before, who knows each part, and what reviewers expect. New contributors and newer maintainers cannot draw on it, and experienced maintainers spend review time recalling it. VTK-History asks which maintenance tasks the history can support directly, and measures each against what happened on past merge requests (MRs).

## Data

All sources are public and were mirrored through September 30, 2026.

| Source | Items | What is used |
|---|---|---|
| GitLab vtk/vtk MRs | 13,759 | Title, description, changed files, revisions, discussions, reviewers |
| GitLab vtk/vtk issues | 5,193 | Title, description, comments, links to MRs |
| Review comments | 55,942 on 11,995 MRs (2015 to 2026) | Text, the code it was on, whether the author changed that code afterward |
| VTK Discourse | 7,746 topics | Title and posts |
| Kitware blog and VTK docs | 1,058 posts plus the coding guides | Text and documented rules |
| Git history | 79,907 commits since 1994 | Message, files and functions changed, date landed; 25,667 linked to their MR |

From the review comments the project derived 217 conventions (for example "use `this->` for member access") from 1,490 comments that apply them. Everything is indexed for keyword search and embedding search (qwen3-embedding). Local models run through Ollama on a DGX Spark.

## Method

Every test replays past MRs. Each prediction uses only history from before the MR was opened, is scored against what happened on that MR, and is compared to a baseline that needs no history or less of it.

## Results

| Workflow | What the history provides | Measured |
|---|---|---|
| Triage an issue or forum question | Earlier issues, MRs and threads about the same problem | Linked issue in the top 5 of about 3,700 for 84% of 300 MRs (title alone 73%, chance 0.13%) |
| Route an MR to reviewers | Who reviewed and changed these files recently, and their response time | An actual reviewer in the top 3 for 76% of 1,656 MRs, against 67% for the most active reviewers |
| Weigh a review comment | How often authors act on each convention | Brier score 0.194 against 0.218 for the overall rate |
| Reduce routine comments | Conventions an existing tool could enforce | 25 conventions behind 217 comments (15% of convention comments) match clang-tidy checks VTK does not enable |
| Evaluate AI tools on VTK | What reviewers asked for and what authors changed | The answer key for the results below |

Three uses did not hold up. An AI review agent on qwen3-coder-next or gpt-5.4-mini matched a reviewer's concern for 7 and 15 of 583 reviewer comments; about 1 agent comment in 25 matched for both models. Two VTK reviewers on the same MR comment within 5 lines of each other 10 to 17% of the time. Ranking conventions by file history put the one a reviewer raised in the top 10 for 19% of 177 MRs, against 20% for the 10 most common. Given a reviewer's comment, gpt-5.4-mini wrote an acceptable fix for 53% of 150 comments; adding similar past comments, random past fixes, or earlier commits to the same function gave 50%, 47% and 53%, all within run-to-run variation.

## The MR briefing

The project's trame app has a Briefing tab that, given an MR number, shows in about 4 seconds the related history, suggested reviewers, conventions applied to the changed files with their follow-through, deprecated APIs in the added lines, and recent commits on the changed files. Each section shows its measured accuracy. For !13389 (Mesa offscreen rendering through EGL), the briefing surfaced an earlier attempt at the same change (!12591) and Mesa offscreen issues back to 2005, and its top two suggested reviewers were the two people who reviewed the MR.

## Limitations and next steps

The answer keys are conservative: an unlinked related issue counts as a miss, and a reviewer who approved without commenting is not counted. All results are for VTK alone, and larger AI models are untested. Next steps are pilots of issue triage and reviewer routing with VTK maintainers, a module coverage map for maintenance planning, and a proposal to enable the matching clang-tidy checks with before-and-after comment counts.
