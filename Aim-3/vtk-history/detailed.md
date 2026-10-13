# VTK-History Detailed Technical Report

## 1. Background

VTK's development history records decisions that are not in the code or the documentation: why an approach was rejected, which earlier MR tried the same change, who reviews each module, and which conventions reviewers enforce. That history spans 11 years of GitLab MRs and review discussions, 8 years of Discourse threads, and 32 years of commits. It is used today only by the maintainers who remember it.

The other Aim 3 work gives assistants knowledge of the VTK API and its examples. VTK-History covers the project's process: what reviewers ask for, who knows which code, and what happened before. The question is which maintenance tasks this history can support directly, measured against what happened on past MRs. Each result below is reported whether or not it held up.

Code, evaluation scripts and setup instructions are at [github.com/jlee-kitware/vtk-history](https://github.com/jlee-kitware/vtk-history) under the BSD 3-Clause license.

## 2. Data

All sources are public and were mirrored through September 30, 2026.

| Source | Items | What is used |
|---|---|---|
| GitLab vtk/vtk MRs | 13,759 | Title, description, changed files, revisions, discussions, reviewers |
| GitLab vtk/vtk issues | 5,193 | Title, description, comments, links to MRs |
| Review comments | 55,942 on 11,995 MRs (March 2015 to September 2026) | Text, the code it was on, whether the author changed that code afterward |
| VTK Discourse | 7,746 topics | Title and posts (CC BY-NC-SA 3.0) |
| Kitware blog and VTK docs | 1,058 posts plus the coding guides | Text, and documented rules with their dates |

The GitLab mirror uses a read-only token from an account with no project memberships, so only public content enters it. The first sync took about 20,000 requests at one per second; later syncs fetch only what changed.

For 22,277 comments on specific lines, the extractor recovers the code the comment was written on and records whether the author changed those lines in a later revision. This follow-through label is used throughout. A local model labels each thread with a topic and any convention it states; drafting, verification and merging steps reduce these to 217 conventions grounded in 1,490 comments.

The git history is indexed separately: 79,907 non-merge commits on master back to 1994, each with its message, changed files, the functions changed (from diff hunk headers), and the date it landed on master. Merge commits carry a `Merge-request: !N` trailer, which links 25,667 commits (everything merged through GitLab since 2015) to their MR and its review discussion. The landing date matters: 11% of VTK commits landed more than 30 days after they were written, so dating by author date would leak later changes into tests that must use only earlier history.

All text is indexed for keyword search and for embedding search with qwen3-embedding, about 104,000 documents plus the commits. Local models (qwen3-coder-next and gpt-oss:120b) run through Ollama on a DGX Spark.

## 3. Method

Every test replays past MRs. Each prediction uses only history from before the MR was opened and is scored against what happened on that MR. Each is compared to a baseline that needs no history or less of it.

| Capability | Test set | Scored against | Baseline |
|---|---|---|---|
| Related issues | 300 MRs whose description links an issue | The linked issue, with the link removed from the query | Random pick; title-only search |
| Related earlier MRs | 300 MRs whose description links an earlier MR | The linked MR | Random pick; title-only search |
| Reviewer suggestion | 1,656 MRs opened since January 2025 with a reviewer | Who actually commented | The 3 most active reviewers at that date |
| Follow-through estimate | 532 comments in 7 six-month windows, each fit on earlier windows | Whether the author changed the commented lines | The overall follow-through rate |
| Predicting review concerns | 177 MRs opened after July 2024 | Conventions reviewers raised on that MR | The 10 most common conventions |
| AI review agent | 149 past MRs with reviewer comments | Reviewer comments on the same concern and lines | The same agent without mined conventions |
| Reviewer agreement | 1,055 MRs with line comments from 2 or more reviewers | Another reviewer's comment within 5 lines | None; reference for the agent |
| Writing the fix | 150 acted-on line comments from 2023 on, one per MR | The author's change within 3 lines; a judge's verdict | The same model without examples |

The judge for agent comments and fixes (gpt-oss:120b) was checked two ways. It rated 73% of real reviewer comments worth posting, and 0% of the same comments when attached to an unrelated MR. Of agent comments it rated worth posting, 41% were on lines the author later changed, against 21% for random changed lines and 15% for comments it rated wrong.

## 4. Results that held up

**Related history.** Searching the history with an MR's title and description found the linked issue in the top 5 for 84% of MRs and in the top 10 for 89%, out of a median of 3,728 issues (chance: 0.13% for the top 5). The title alone reached 73% in the top 5, so the description adds 11 points. Linked earlier MRs are harder to find because there are more of them (a median of 9,895) and many share wording: 51% in the top 5 (title alone 44%) and 56% in the top 10.

**Reviewers.** Suggestions rank people by recent reviews and commits on the same files, directories and modules. An actual reviewer was in the top 3 for 76% of 1,656 MRs, against 67% for the three most active reviewers. The top suggestion reviewed the MR 53% of the time, against 47% for the most active reviewer. The person who replied first was in the top 3 for 58% of MRs, against 46%.

**Follow-through.** Each convention gets an estimate of how often authors change their code when a reviewer raises it. On held-out windows:

| Predictor | Brier score (lower is better) |
|---|---|
| Overall follow-through rate | 0.218 |
| Earlier hand-weighted points per convention | 0.229 |
| Convention history | 0.204 |
| Convention history and comment form (suggestion block, question, reviewer) | 0.194 |

The Brier score is the mean squared error of a predicted probability. Comments on the 29 conventions rated high were acted on 88% of the time, where the comment form alone predicts 74%. For the 37 rated low it was 59% against 70%. Adding the author made the score worse; pooling duplicate conventions improved it slightly (0.1941 to 0.1935).

**Checks a tool could make.** 25 of the 217 conventions match a clang-tidy check VTK does not enable. Reviewers wrote 217 of the 1,490 convention comments (15%) for them, led by braces on every block (36 comments across two conventions), anonymous namespaces (23), C++-style casts (19) and range-based for loops (19). Another 16 conventions (112 comments) are already enforced by a tool.

**Reviewer agreement.** Of 1,055 MRs with line comments from two or more reviewers, another reviewer commented within 5 lines of a given comment 16.7% of the time, and 10.0% when both comments were on the same revision. A second reviewer often skips a point already made, so this understates independent agreement. It sets the scale for the agent results: agent comments landed within 5 lines of a reviewer's 15 to 20% of the time.

## 5. Results that did not hold up

**AI review agent.** An agent on qwen3-coder-next reviewed past MRs with and without the mined conventions and tool results. On all 149 MRs, both versions wrote 0.48 comments per MR that the judge rated worth posting. Variants on a 40-MR subset changed the count but not the error rate:

| Agent setup (40 MRs) | Judged worth posting, per MR | Judged wrong |
|---|---|---|
| No conventions | 0.35 | 40% |
| Conventions shown next to the changed code | 0.72 | 42% |
| Conventions and formatter, spelling and static-check results | 0.47 | 26% |
| Compiler warnings and clang-tidy run on the MR | 0.75 | 39% |

The same setup on gpt-5.4-mini cost $5.79 for 149 MRs:

| Against 583 reviewer comments on 149 MRs | qwen3-coder-next | gpt-5.4-mini |
|---|---|---|
| Agent comments | 171 | 365 |
| Reviewer concerns matched (same concern, same lines) | 7 (1.2%) | 15 (2.6%) |
| Agent comments that match a reviewer concern | 4.1% | 4.1% |
| Minutes per MR | 1.4 | 0.8 |

For both models, 1 comment in 25 raised something a reviewer asked for. gpt-5.4-mini matched more concerns because it wrote more comments. The judge's ratings did not track what authors changed for gpt-5.4-mini (25% of lines rated good were later changed, against 26% rated wrong), while for the local model they did (44% against 16%).

**Predicting review concerns.** For 177 MRs, conventions were ranked by how often reviewers had raised them on the same files, by similarity to the added code, and by both. The convention a reviewer raised was in the top 10 for 19%, 14% and 18% of MRs; the 10 most common conventions overall reached 20%. Which convention a reviewer raises depends on the reviewer and the specific change more than on the file. The briefing shows past conventions for the changed files as a checklist, unranked.

**Writing the fix.** Given the code window (30 lines on each side) and a reviewer's comment, gpt-5.4-mini wrote a fix the judge rated as addressing the comment for 53% of 150 comments, and reproduced the author's change exactly for 12%:

| gpt-5.4-mini on 150 comments | Addresses the comment | Same fix as the author (judge) | Exact match |
|---|---|---|---|
| No examples | 80 (53%) | 27 | 18 |
| 3 random earlier VTK fixes | 70 (47%) | 19 | 12 |
| 3 earlier comments worded like this one, with their fixes | 75 (50%) | 23 | 14 |
| Up to 3 earlier commits to the same function or file | 79 (53%) | 19 | 16 |

The similar-comment run differed from no examples by -3 points (95% interval -13 to +5, sign test p = 0.56). For 41 comments no earlier commits to the same code existed, so the same-code run sent the same prompt as the no-examples run; it scored 61% against 46% on those, a 15-point difference from sampling alone. None of the three ways of adding history moved the result outside that variation. The local model addressed 42% of the first 50 comments. The test cost $1.80.

## 6. The tools

The history is presented in a trame app with six tabs. Every control has a tooltip that says what it does.

| Tab | What it shows |
|---|---|
| Briefing | What the history says about one MR, with the measured accuracy of each section |
| Review | Suggested reviewers and past review comments for an MR, and the AI review results |
| Rules | The 217 conventions with their source comments, follow-through level, and matching clang-tidy check |
| Deprecations | Every API VTK deprecated: when, why, in which MR, and whether it was removed |
| Trends | Terms, code areas and themes whose share of MRs or forum topics rose or fell |
| Search | Keyword and embedding search over MRs, issues, review threads, forum posts, blogs, docs and release notes |

The Briefing tab assembles its sections in about 4 seconds per MR. For a closed MR it uses only history from before the MR was opened, so it shows what was knowable at the time.

| Section | What it shows | Accuracy shown |
|---|---|---|
| Related history | 5 issues, 5 earlier MRs and 3 forum topics, marking any the description already links | Linked issue in the top 5 for 84% |
| Suggested reviewers | 5 people, with their reviews and commits on these files and typical reply time | An actual reviewer in the top 3 for 76% |
| Conventions | Up to 8 conventions reviewers applied on these files, with follow-through estimates | Shown as a checklist |
| Deprecated APIs | Deprecated or removed APIs used in the added lines, confirmed in the headers at that revision | Checked against the deprecation records |
| File history | The last 3 commits on each of the 4 most-changed files | Not measured |

## 7. Example: !13389

!13389 added native Mesa offscreen rendering to the EGL render window and was merged in 2026. Using only history from before it was opened, the briefing listed !12591, an earlier attempt at the same change, and Mesa offscreen rendering issues going back to 2005. The top two suggested reviewers were the two people who reviewed the MR. A contributor opening this MR would have seen the earlier attempt and its review discussion, and the MR could have been routed to its reviewers when it opened.

## 8. Limitations

The answer keys are conservative. A related issue that the description does not link counts as a miss, and a reviewer who approved without commenting is not counted. The follow-through label records whether the author changed the commented lines, which is not always agreement; a model-based check of whether each comment was addressed agreed with it 94% of the time. All results are for VTK alone. The AI results use qwen3-coder-next and gpt-5.4-mini; larger models are untested.

## 9. Next steps

- **Issue and forum triage.** Suggest related issues, MRs and forum threads when an issue or topic is opened, piloted with VTK maintainers on open issues.
- **Reviewer routing.** Suggest reviewers with typical response times when an MR opens, piloted on open MRs.
- **Module coverage map.** Who has recently reviewed or written each module, which modules have one or no active reviewer, and where issue and forum activity is rising.
- **Clang-tidy checks.** Propose enabling the checks behind the most frequent tool-enforceable conventions, and count review comments on those conventions before and after.
- **Wider evaluation.** Run the related-history test on every MR that links an issue, and repeat the evaluations on ParaView.

## 10. Conclusion

VTK's history supports three maintenance tasks with measured accuracy: finding related earlier work, routing MRs to reviewers, and weighing review conventions. It identifies 25 conventions a tool could enforce. It did not make AI review agents or AI fix suggestions match VTK's reviewers more closely. Its measured value today is in giving maintainers context and in providing the answer key for evaluating AI tools on VTK, including the tools in the rest of Aim 3.
