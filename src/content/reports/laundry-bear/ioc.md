---
reportId: streamerapp-laundry-bear-browser-implant
---

## Infrastructure

| Type | Value | Notes |
| --- | --- | --- |
| Domain | `pastefy.app` | Remote JavaScript staging observed in the analyzed chain |
| Process | `msedge.exe` | Headless Chromium/Edge execution in the browser stage |
| DLL host | `control.exe` | Loads the CPL applet |

## Execution Artifacts

| Artifact | Value |
| --- | --- |
| Initial vector | Phishing-delivered `.cpl` file |
| Temp naming | Random `%TEMP%/<12 chars>` directory |
| Browser mode | Headless Edge / Chromium |
| C2 style | Browser-based implant over remote JavaScript |

## Detection Notes

- Track suspicious `control.exe` execution paths leading to browser child processes.
- Hunt for headless Chromium or Edge launched with abnormal command-line flags.
- Correlate temporary directory creation with browser startup and remote script retrieval.
