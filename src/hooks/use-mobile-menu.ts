
import { atom, useAtom } from "jotai";

export type MobileMenuConfig = {
  isOpen: boolean;
};

const mobileMenuConfig = atom<MobileMenuConfig>({
  isOpen: false,
});

export function useMobileMenuConfig() {
  return useAtom(mobileMenuConfig);
}