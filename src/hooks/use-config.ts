import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { layoutType, sidebarType, navBarType } from "@/lib/type";

export type Config = {
  collapsed: boolean;
  theme: string;
  skin: "default" | "bordered";
  layout: layoutType;
  sidebar: sidebarType;
  menuHidden: boolean;
  showSearchBar: boolean;
  showSwitcher: boolean;
  topHeader: "default" | "links";
  contentWidth: "wide" | "boxed";
  navbar: navBarType;
  footer: "sticky" | "default" | "hidden";
  isRtl: boolean;
  subMenu: boolean;
  hasSubMenu: boolean;
  sidebarColor: string;
  headerColor: string;
  sidebarBgImage?: string;
  radius: number;
};
export const defaultConfig: Config = {
  collapsed: false,
  theme: "zinc",
  skin: "default",
  layout: "vertical",
  sidebar: "classic",
  menuHidden: false,
  showSearchBar: true,
  topHeader: "default",
  contentWidth: "wide",
  navbar: "sticky",
  footer: "default",
  isRtl: false,
  showSwitcher: true,
  subMenu: false,
  hasSubMenu: false,
  sidebarColor: "light",
  headerColor: "light",
  sidebarBgImage: undefined,
  radius: 0.5,
};

const configAtom = atomWithStorage<Config>("config", defaultConfig);

export function useConfig() {
  return useAtom(configAtom);
}
