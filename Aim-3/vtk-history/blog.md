# VTK-History: Measuring What VTK's Development History Is Worth

## 1. The Challenge

Much of what a VTK maintainer needs to know is not in the code or the documentation. It is in the project's history: the earlier MR that tried the same change, the issue that explains why a workaround exists, the reviewer who knows a module, the convention a reviewer will ask for. VTK has 11 years of GitLab merge requests (MRs) and review discussions, 8 years of Discourse threads, and 32 years of commits. Today that history is used only by the people who remember it. New contributors and newer maintainers cannot draw on it, and experienced maintainers spend review time recalling it.

We set out to measure, for each maintenance task, whether the history helps and by how much, compared with what happened on real MRs.

## 2. The Implementation

VTK-History mirrors VTK's public history locally: 13,759 MRs, 5,193 issues, 55,942 review comments, 7,746 forum topics, 1,058 blog posts, and 79,907 commits. For every line comment it recovers the code the comment was on and whether the author changed that code before the MR merged. A local model labels review threads, and from them we derived 217 conventions, each with an estimate of how often authors act on it. A commit index records the functions each commit changed and the MR that merged it. Everything is searchable by keyword and by meaning (embedding search with qwen3-embedding), and models run locally on a DGX Spark.

Every capability is tested the same way. We replay past MRs, give the tool only the history that existed before each MR was opened, and compare its output with what happened. Each result is compared with a baseline that uses no history or less of it.

## 3. The Example

!13389 added native Mesa offscreen rendering to VTK's EGL render window. Given only the MR number, the app's Briefing tab gathers in about 4 seconds what the history says about it, using only history from before the MR was opened. It listed !12591, an earlier attempt at the same change, and Mesa offscreen issues going back to 2005. Its top two suggested reviewers were the two people who reviewed the MR. The briefing also lists conventions reviewers have applied to the changed files, deprecated APIs in the added code, and recent commits to those files.

The example matches the measured numbers. Over 300 past MRs, the issue an MR fixes was in the top 5 search results, out of about 3,700 issues, 84% of the time. Over 1,656 MRs, an actual reviewer was in the top 3 suggestions 76% of the time, against 67% for simply naming the three most active reviewers.

## 4. Why This Matters?

The history gives people context they would otherwise have to remember or dig for: related earlier work, the right reviewers, and how reviewers treat each convention. It also shows which review comments a tool could make: 25 conventions, behind 15% of convention comments, match clang-tidy checks VTK does not enable.

We also measured where the history did not help. AI review agents, on a local model and on gpt-5.4-mini, raised the same concern as a VTK reviewer for about 1 comment in 25, with or without the mined conventions. For scale, two VTK reviewers on the same MR comment within 5 lines of each other only 10 to 17% of the time. Given a reviewer's comment, gpt-5.4-mini wrote an acceptable fix about half the time, and examples from the history (similar past comments or earlier changes to the same function) did not improve that.

Those negative results depend on the history too. Its record of what reviewers asked for and what authors changed is the answer key that made these AI measurements possible, and it can be used to test any AI tool proposed for VTK.

## 5. Conclusion

VTK's history measurably helps with triage, reviewer routing, and weighing review conventions, and the Briefing tab puts those results in front of a maintainer in seconds with their accuracy labeled. The next steps are pilots of issue triage and reviewer suggestions with VTK maintainers, a module coverage map for planning maintenance, and a proposal to enable the matching clang-tidy checks. The code and evaluation scripts are at [github.com/jlee-kitware/vtk-history](https://github.com/jlee-kitware/vtk-history).
