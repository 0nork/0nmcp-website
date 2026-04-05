
import { atom, useAtom } from "jotai";

export type ChatConfig = {
  isOpen: boolean;
  showInfo: boolean;
  showProfile: boolean;
};

const chatConfigAtom = atom<ChatConfig>({
  isOpen: false,
  showInfo: false,
  showProfile: false,
});

export function useChatConfig() {
  return useAtom(chatConfigAtom);
}
