import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export type TodoConfig = {
  isOpen: boolean
}

const todoConfigAtom = atomWithStorage<TodoConfig>("todoConfig", {
  isOpen: false,
 
})

export function useTodoConfig() {
  
  return useAtom(todoConfigAtom)
}
