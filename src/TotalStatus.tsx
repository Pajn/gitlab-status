import React, {
  createContext,
  useState,
  useMemo,
  useContext,
  ReactNode,
} from "react"
import Favicon from "react-favicon"
import { getIcon } from "./icons/icons"

const totalStatusContext = createContext<
  (projectId: string, status: string) => void
>(undefined as any)

export const useSetProjectStatus = () => useContext(totalStatusContext)

export const TotalStatusProvider = ({ children }: { children: ReactNode }) => {
  const [projectStatuses, setProjectStatuses] = useState(new Map())

  const context = useMemo(
    () => (projectId: string, status: string) => {
      setProjectStatuses(map => {
        if (map.get(projectId) === status) return map

        map = new Map(map)
        map.set(projectId, status)
        return map
      })
    },
    [],
  )

  return (
    <totalStatusContext.Provider value={context}>
      <Favicon url={getIcon(...Array.from(projectStatuses.values()))} />
      {children}
    </totalStatusContext.Provider>
  )
}
