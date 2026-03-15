export const locales = ["en", "pl"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const ui = {
  en: {
    nav: {
      subtitle: "Malware Analysis Lab",
      reports: "Reports",
      github: "GitHub",
      language: "Language",
      english: "ENG",
      polish: "PL",
    },
    home: {
      heroKicker: "Cyber Threat Intelligence",
      role: "Malware Analyst / CTI Researcher",
      heroDescription:
        "Tracking adversaries. Dissecting malware. Publishing open-source threat intelligence to help defenders stay ahead.",
      githubLabel: "/irondefence",
      reportsLabel: "View reports",
      aboutIndex: "01 / About",
      aboutTitle: "Analyst Profile",
      aboutP1:
        "Security researcher focused on understanding the adversary: how malware operates, how campaigns are structured, and how threat actors evolve their tradecraft over time.",
      aboutP2:
        "Every report published here is the result of hands-on reverse engineering, sandbox analysis, and OSINT research. Technical findings are translated into actionable intelligence.",
      aboutRaw: "// No vendor hype. No marketing fluff. Just raw analysis.",
      stats: [
        { title: "Malware", label: "Samples analyzed" },
        { title: "IOC", label: "Sets published" },
        { title: "YARA", label: "Rules written" },
      ],
      capabilities: [
        {
          title: "Malware Analysis",
          description:
            "Static & dynamic analysis of PE, scripts, and fileless threats.",
        },
        {
          title: "Threat Hunting",
          description:
            "Proactive hunting across telemetry using ATT&CK framework TTPs.",
        },
        {
          title: "CTI Production",
          description:
            "Structured threat reports, IOC extraction, and actor profiling.",
        },
        {
          title: "OSINT Research",
          description:
            "Open-source intelligence gathering and infrastructure tracking.",
        },
      ],
      reportsIndex: "02 / Reports",
      reportsTitle: "Threat Intelligence",
      reportsIntro:
        "Each report documents a real-world malware sample or campaign from initial triage through full reverse engineering. IOCs, YARA rules and ATT&CK TTPs are included.",
      allReports: "All reports >",
      accessAll: "Access all reports",
      readReport: "Read report >",
      footerLeft: "// irondefence © 2026",
      footerRight: "Threat intelligence for educational purposes only",
      previewThemes: [
        { tag: "Featured", severity: "Critical", tone: "critical" as const },
        { tag: "Intel", severity: "High", tone: "high" as const },
        { tag: "Archive", severity: "Medium", tone: "medium" as const },
      ],
      fallbackReports: [
        {
          title: "Additional malware write-ups in progress",
          description:
            "Upcoming reports will extend the archive with new reverse engineering notes and CTI observations.",
          tag: "Intel",
          severity: "High",
          tone: "high" as const,
        },
        {
          title: "Detection-focused case studies incoming",
          description:
            "Future entries will cover behavior chains, IOCs, ATT&CK mapping and response-oriented conclusions.",
          tag: "Archive",
          severity: "Medium",
          tone: "medium" as const,
        },
      ],
    },
    archive: {
      title: "Reports | MalReports",
      description: "Full archive of malware and CTI reports.",
      kicker: "Reports Archive",
      heading: "All Reports",
      intro:
        "Central archive for malware analysis notes, reverse engineering write-ups and CTI observations. Each entry is published as a standalone report ready for fast review.",
      pills: [
        "English default",
        "Optional Polish translation",
        "Static archive",
      ],
      empty: "No reports published yet.",
      open: "Open report >",
    },
    report: {
      back: "Back to archive",
      dossier: "Report dossier",
      pageContents: "Page contents",
      relatedReports: "Other reports",
      toggleSidebar: "Toggle report sidebar",
      contentTab: "Report",
      yaraTab: "YARA rules",
      yaraTitle: "Detection rules",
      yaraEmpty: "No YARA rules attached to this report.",
      published: "Published",
      reportId: "Report ID",
      language: "Language",
      available: "Available",
      tlp: "TLP",
      sections: "Sections",
      tags: "Tags",
      format: "Format",
      formatValue: "Markdown + Shiki",
      english: "English",
      polish: "Polish",
    },
  },
  pl: {
    nav: {
      subtitle: "Laboratorium Analizy Malware",
      reports: "Raporty",
      github: "GitHub",
      language: "Jezyk",
      english: "ENG",
      polish: "PL",
    },
    home: {
      heroKicker: "Cyber Threat Intelligence",
      role: "Analityk malware / badacz CTI",
      heroDescription:
        "Sledzenie adwersarzy. Analiza malware. Publikowanie otwartego threat intelligence dla zespolow obronnych.",
      githubLabel: "/irondefence",
      reportsLabel: "Zobacz raporty",
      aboutIndex: "01 / O autorze",
      aboutTitle: "Profil analityczny",
      aboutP1:
        "Badacz security skupiony na rozumieniu przeciwnika: jak dziala malware, jak budowane sa kampanie i jak ewoluuje tradecraft aktorow.",
      aboutP2:
        "Kazdy raport to wynik praktycznego reverse engineeringu, analizy sandboxowej i badan OSINT. Techniczne ustalenia sa przekladane na konkretne wnioski operacyjne.",
      aboutRaw:
        "// Bez vendor hype. Bez marketingowego szumu. Tylko surowa analiza.",
      stats: [
        { title: "Malware", label: "Przeanalizowane probki" },
        { title: "IOC", label: "Zestawy opublikowane" },
        { title: "YARA", label: "Reguly napisane" },
      ],
      capabilities: [
        {
          title: "Analiza Malware",
          description:
            "Analiza statyczna i dynamiczna PE, skryptow i zagrozen fileless.",
        },
        {
          title: "Threat Hunting",
          description:
            "Proaktywny hunting po telemetrii z wykorzystaniem TTP i ATT&CK.",
        },
        {
          title: "Produkcja CTI",
          description:
            "Raporty, ekstrakcja IOC i profilowanie aktorow zagrozen.",
        },
        {
          title: "Research OSINT",
          description:
            "Badania open-source i sledzenie infrastruktury kampanii.",
        },
      ],
      reportsIndex: "02 / Raporty",
      reportsTitle: "Threat Intelligence",
      reportsIntro:
        "Kazdy raport dokumentuje rzeczywista probke malware lub kampanie od triage po reverse engineering. Zawiera IOC, reguly YARA i TTP mapowane do ATT&CK.",
      allReports: "Wszystkie raporty >",
      accessAll: "Przejdz do archiwum",
      readReport: "Czytaj raport >",
      footerLeft: "// irondefence © 2026",
      footerRight: "Threat intelligence wyłącznie do celów edukacyjnych",
      previewThemes: [
        { tag: "Lead", severity: "Krytyczny", tone: "critical" as const },
        { tag: "Intel", severity: "Wysoki", tone: "high" as const },
        { tag: "Archiwum", severity: "Sredni", tone: "medium" as const },
      ],
      fallbackReports: [
        {
          title: "Kolejne analizy malware w przygotowaniu",
          description:
            "Nastepne raporty rozszerza archiwum o nowe notatki reverse engineering i obserwacje CTI.",
          tag: "Intel",
          severity: "Wysoki",
          tone: "high" as const,
        },
        {
          title: "Nadchodza case studies skupione na detekcji",
          description:
            "Przyszle wpisy obejma lancuchy zachowan, IOC, mapowanie ATT&CK i wnioski dla obrony.",
          tag: "Archiwum",
          severity: "Sredni",
          tone: "medium" as const,
        },
      ],
    },
    archive: {
      title: "Raporty | MalReports",
      description: "Pelne archiwum raportow malware i CTI.",
      kicker: "Archiwum raportow",
      heading: "Wszystkie raporty",
      intro:
        "Centralne archiwum analiz malware, wpisow reverse engineering i obserwacji CTI. Kazdy wpis jest publikowany jako samodzielny raport gotowy do szybkiego wykorzystania.",
      pills: [
        "Domyslnie ENG",
        "Opcjonalne tlumaczenie PL",
        "Archiwum statyczne",
      ],
      empty: "Brak opublikowanych raportow.",
      open: "Otworz raport >",
    },
    report: {
      back: "Powrot do archiwum",
      dossier: "Dossier raportu",
      pageContents: "Spis tresci",
      relatedReports: "Inne raporty",
      toggleSidebar: "Przelacz sidebar raportow",
      contentTab: "Raport",
      yaraTab: "Reguly YARA",
      yaraTitle: "Reguly detekcyjne",
      yaraEmpty: "Brak dolaczonych regul YARA dla tego raportu.",
      published: "Publikacja",
      reportId: "ID raportu",
      language: "Jezyk",
      available: "Dostepne",
      tlp: "TLP",
      sections: "Sekcje",
      tags: "Tagi",
      format: "Format",
      formatValue: "Markdown + Shiki",
      english: "English",
      polish: "Polski",
    },
  },
} as const;
