import { ColumnConfig } from "./Dashboard"

export type Config = {
  gitlabUrl: string
  dashboards: Array<{
    name: string
    columns?: ColumnConfig
    widgets: Array<{
      type: "ProjectStatus"
      projectPath: string
    }>
  }>
}

export type Settings = {
  accessToken: string
  config: Config
}

export let settings: Settings | undefined

// eslint-disable-next-line no-lone-blocks
{
  try {
    const accessToken = localStorage.getItem("accessToken")
    const config = localStorage.getItem("config")

    if (accessToken && config) {
      settings = {
        accessToken,
        config: JSON.parse(config),
      }
    }
  } catch (err) {
    console.error("Error reading config", err)
  }
}

export function saveSettings(settings: Settings) {
  localStorage.setItem("accessToken", settings.accessToken)
  localStorage.setItem("config", JSON.stringify(settings.config))
  window.location.reload()
}
