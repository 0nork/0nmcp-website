
export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};
export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string, t?: any): Group[] {
  const label = (key: string) => t ? t(key) : key;

  return [
    {
      groupLabel: "Main",
      id: "main",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard",
          label: "Dashboard",
          active: pathname === "/dashboard",
          icon: "heroicons-outline:home",
          submenus: [],
        },
        {
          id: "setup",
          href: "/setup",
          label: "Setup Wizard",
          active: pathname === "/setup",
          icon: "heroicons-outline:sparkles",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Connections",
      id: "connections",
      menus: [
        {
          id: "connect",
          href: "/dashboard/connect",
          label: "Connect Services",
          active: pathname.includes("/dashboard/connect"),
          icon: "heroicons-outline:link",
          submenus: [],
        },
        {
          id: "install",
          href: "/dashboard/install",
          label: "Install Platforms",
          active: pathname.includes("/dashboard/install"),
          icon: "heroicons-outline:arrow-down-tray",
          submenus: [
            {
              href: "/dashboard/install",
              label: "All Platforms",
              active: pathname === "/dashboard/install",
              icon: "heroicons-outline:squares-2x2",
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Tools",
      id: "tools",
      menus: [
        {
          id: "console",
          href: "/console",
          label: "Console",
          active: pathname.includes("/console"),
          icon: "heroicons-outline:command-line",
          submenus: [
            {
              href: "/console",
              label: "AI Chat",
              active: pathname === "/console",
              icon: "heroicons-outline:chat-bubble-left-right",
            },
            {
              href: "/console/builder/canvas",
              label: "Canvas Builder",
              active: pathname.includes("/console/builder"),
              icon: "heroicons-outline:paint-brush",
            },
            {
              href: "/console/marketplace",
              label: "Marketplace",
              active: pathname.includes("/console/marketplace"),
              icon: "heroicons-outline:shopping-bag",
            },
            {
              href: "/console/integrations",
              label: "Integrations",
              active: pathname.includes("/console/integrations"),
              icon: "heroicons-outline:puzzle-piece",
            },
          ],
        },
        {
          id: "workflows",
          href: "/builder",
          label: "Workflow Builder",
          active: pathname.includes("/builder"),
          icon: "heroicons-outline:bolt",
          submenus: [],
        },
        {
          id: "audit",
          href: "/audit",
          label: "Site Audit",
          active: pathname === "/audit",
          icon: "heroicons-outline:magnifying-glass",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Community",
      id: "community",
      menus: [
        {
          id: "forum",
          href: "/forum",
          label: "Forum",
          active: pathname.includes("/forum"),
          icon: "heroicons-outline:chat-bubble-left-ellipsis",
          submenus: [],
        },
        {
          id: "learn",
          href: "/learn",
          label: "Courses",
          active: pathname.includes("/learn"),
          icon: "heroicons-outline:academic-cap",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Account",
      id: "account",
      menus: [
        {
          id: "billing",
          href: "/dashboard/billing",
          label: "Billing",
          active: pathname.includes("/dashboard/billing"),
          icon: "heroicons-outline:credit-card",
          submenus: [],
        },
        {
          id: "settings",
          href: "/dashboard/settings",
          label: "Settings",
          active: pathname.includes("/dashboard/settings"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [],
        },
      ],
    },
  ];
}
