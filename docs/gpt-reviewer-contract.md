# GPT Reviewer Contract

## Required Inputs

A reviewer should inspect:

- The original loop document.
- The Codex execution report.
- The waiting-review signal.
- The changed files or pull request.
- Validation output recorded by Codex.
- Any human approval notes.

The reviewer should not rely only on the summary. The acceptance criteria in the loop document define the review target.

## Reading Acceptance Criteria

Review each acceptance criterion as a separate requirement. Mark it complete only when the implementation or report provides evidence.

If the result is useful but incomplete, the review should name the missing items and recommend a follow-up loop or retry.

## Inspecting Reports

Check whether the report lists files inspected, files changed, validation performed, errors, and uncertainty.

If the report claims validation passed without command evidence, treat that as a review risk.

## Verdicts

Recommended verdict values are:

- `accepted`: the loop satisfies the acceptance criteria.
- `changes-requested`: the work is close but needs another Codex pass.
- `blocked`: a human decision or external condition is required.
- `rejected`: the result does not meet the loop and should not proceed.
- `superseded`: a newer loop replaces this one.

## Review Files

Write review files under `reviews/` using `templates/review.md`.

The review should include metadata, verdict, completed items, missing items, risks, spec deviations, human decisions, and next loop recommendation.

## Reviewed Signals

After the review file is written, emit a JSON signal under `signals/reviewed/`.

The signal should include the loop id, verdict, review path, reviewed timestamp, reviewer identity, and routing recommendation.

## Follow-Up Loops

Create a follow-up loop when the next step is substantial, changes scope, or requires new human approval.

The follow-up loop should reference the previous loop id and explain what changed.

## Human Approval

Human approval is required for high-risk changes, ambiguous business decisions, production impact, credentials, cost-bearing actions, or irreversible operations.

If the reviewer detects that required approval was missing, the verdict should be `blocked` unless a human explicitly approves the result.
