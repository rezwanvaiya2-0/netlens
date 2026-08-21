export type NavItem = {
  title: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const docsNav: NavGroup[] = [
  {
    label: "Docs",
    items: [
      {
        title: "Introduction",
        href: "/docs/introduction",
        description: "What NetLens is and how the stack fits together.",
      },
      {
        title: "Installation",
        href: "/docs/installation",
        description: "Deploy the container, open the dashboard, verify the first flows.",
      },
      {
        title: "Data Folders & Bind Mounts",
        href: "/docs/data-folders",
        description: "Where your data lives and why it survives rebuilds.",
      },
      {
        title: "Managing Router Sources",
        href: "/docs/managing-sources",
        description: "Add, list, and remove NetFlow sources in nfsen.conf.",
      },
      {
        title: "Adding a Router on a New Port",
        href: "/docs/new-port",
        description: "Open a UDP port and start collecting in about 3 seconds.",
      },
      {
        title: "Password Protection",
        href: "/docs/password-protection",
        description: "The styled login page, sessions, and credential rules.",
      },
      {
        title: "Data Retention",
        href: "/docs/data-retention",
        description: "Expire and max-size rules that keep the disk from filling up.",
      },
      {
        title: "Troubleshooting",
        href: "/docs/troubleshooting",
        description: "Common failures and the exact commands that fix them.",
      },
    ],
  },
  {
    label: "Integration",
    items: [
      {
        title: "LibreNMS Integration",
        href: "/integration/librenms-integration",
        description: "Share flow data read-only over NFS and show NetFlow graphs in LibreNMS.",
      },
    ],
  },
  {
    label: "Reference",
    items: [
      {
        title: "Commands Cheatsheet",
        href: "/reference/commands",
        description: "Every useful docker exec / docker compose command in one place.",
      },
      {
        title: "Security Notes",
        href: "/reference/security",
        description: "Hardening checklist and least-privilege guidance for the VPS.",
      },
    ],
  },
];

export function getPrevNext(href: string) {
  const flat = docsNav.flatMap((g) => g.items);
  const index = flat.findIndex((i) => i.href === href);
  if (index === -1) return { prev: undefined, next: undefined };
  return {
    prev: index > 0 ? flat[index - 1] : undefined,
    next: index < flat.length - 1 ? flat[index + 1] : undefined,
  };
}
