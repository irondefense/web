import { defaultLocale, locales, type Locale } from "./i18n";

export const routeSegments = {
  reports: {
    en: "reports",
    pl: "raporty",
  },
} as const;

export type RouteKey = keyof typeof routeSegments;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleRoot(locale: Locale = defaultLocale) {
  return `/${locale}/`;
}

export function getLocalizedSegment(route: RouteKey, locale: Locale) {
  return routeSegments[route][locale];
}

export function getLocalizedPath(locale: Locale, route: RouteKey) {
  return `${getLocaleRoot(locale)}${getLocalizedSegment(route, locale)}/`;
}

export function getLocalizedReportPath(reportId: string, locale: Locale) {
  return `${getLocalizedPath(locale, "reports")}${reportId}/`;
}

export function getLocaleSwitchPath(currentPath: string, targetLocale: Locale) {
  const normalized = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0) {
    return getLocaleRoot(targetLocale);
  }

  const [, ...rest] = segments;
  const translated = rest.map((segment, index) => {
    if (index !== 0) {
      return segment;
    }

    if (segment === routeSegments.reports.en || segment === routeSegments.reports.pl) {
      return getLocalizedSegment("reports", targetLocale);
    }

    return segment;
  });

  const path = [targetLocale, ...translated].join("/");
  return `/${path}${normalized.endsWith("/") ? "/" : ""}`;
}
