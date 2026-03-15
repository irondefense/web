# MalReports

Minimalny projekt Astro pod techniczne raporty malware/CTI pisane w Markdown.

## Start

```bash
bun install
bun run dev
```

## Struktura raportow

Kazdy raport ma wlasny katalog:

```text
src/content/reports/<report-id>/en.md
src/content/reports/<report-id>/pl.md
```

Routing jest lokalizowany:

- `en.md` trafia pod `/en/reports/<report-id>/`
- `pl.md` trafia pod `/pl/raporty/<report-id>/`

## Frontmatter

```md
---
reportId: cve-2026-21509-crafty-leshy
lang: en
title: Report title
description: Short summary
date: 2026-03-15
draft: false
tlp: clear
tags:
  - office
  - phishing
---
```
