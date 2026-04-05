import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type MailConfig = {
  isOpen: boolean;
};

const mailConfigAtom = atomWithStorage<MailConfig>("mailConfig", {
  isOpen: false,
});

export function useMailConfig() {
  return useAtom(mailConfigAtom);
}
