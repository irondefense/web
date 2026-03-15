import type { CollectionEntry } from "astro:content";
import type { Locale } from "./i18n";
import { getLocalizedReportPath } from "./routes";

export type ReportEntry = CollectionEntry<"reports">;
export type ReportLang = ReportEntry["data"]["lang"];

export type ReportGroup = {
  reportId: string;
  entries: ReportEntry[];
  primary: ReportEntry;
  byLang: Partial<Record<ReportLang, ReportEntry>>;
};

export function getPreferredReport(entries: ReportEntry[]) {
  return entries.find((entry) => entry.data.lang === "en") ?? entries[0]!;
}

export function buildReportGroups(entries: ReportEntry[]) {
  const groups = new Map<string, ReportEntry[]>();

  for (const entry of entries) {
    const list = groups.get(entry.data.reportId) ?? [];
    list.push(entry);
    groups.set(entry.data.reportId, list);
  }

  return Array.from(groups.entries())
    .map(([reportId, groupedEntries]): ReportGroup => {
      const sortedEntries = [...groupedEntries].sort(
        (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
      );

      const byLang: Partial<Record<ReportLang, ReportEntry>> = {};

      for (const entry of sortedEntries) {
        byLang[entry.data.lang] = entry;
      }

      return {
        reportId,
        entries: sortedEntries,
        primary: getPreferredReport(sortedEntries),
        byLang,
      };
    })
    .sort(
      (a, b) => b.primary.data.date.valueOf() - a.primary.data.date.valueOf(),
    );
}

export function getReportHref(reportId: string, lang: ReportLang = "en") {
  return getLocalizedReportPath(reportId, lang);
}

export function getReportForLocale(group: ReportGroup, locale: Locale) {
  return group.byLang[locale] ?? group.byLang.en ?? group.primary;
}
