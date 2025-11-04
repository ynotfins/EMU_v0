# Append-Only Temporal Rules for Markdown Knowledge

## Scope
Only apply these instructions to:
- Files matching **/memory-bank/**/*.md
- Files matching **/*.md
Ignore all non-Markdown files.

## Writing Policy
When creating or updating any scoped Markdown file:
- Never delete or overwrite prior content.
- Always append a new "Correction" or "Update" block.
- Mark obsolete lines or sections as superseded by referencing exact line ranges from the *previous revision*.
- Do not modify code files or non-Markdown assets.

## Fine-Grained History Format
Every new entry must use the following fenced block and headings:

### New knowledge
Append:
```md
### Update {UTC-ISO-TIMESTAMP}
[status]: active
[id]: <auto-generate a short, unique id like u_20250101_120045_z7m2>
[source]: <human/action/system>
[reason]: <why this was added>

<new content here>
```

### Corrections
When correcting prior information:
```md
### Correction {UTC-ISO-TIMESTAMP}
[status]: active
[id]: <auto-generate a short, unique id>
[source]: <human/action/system>
[supersedes]: lines X-Y from id:<previous-id>
[reason]: <why the correction is needed>

<corrected content here>
```

### Examples
```md
### Update 2025-01-04T12:00:45Z
[status]: active
[id]: u_20250104_120045_abc123
[source]: human
[reason]: Added deployment configuration details

The deployment is now configured for rebuild.4axe.com using Vercel and Cloudflare.
```

## Benefits
- Complete audit trail of all changes
- No information loss
- Clear understanding of evolution
- Ability to trace decisions and corrections
