
import { atom, useAtom } from "jotai";

export type hoverConfig = {
  hovered: boolean;
  
};

const menuHoverConfigAtom = atom<hoverConfig>({
  hovered: false,
  
});

export function useMenuHoverConfig() {
  return useAtom(menuHoverConfigAtom);
}
