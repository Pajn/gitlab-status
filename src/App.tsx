import { ApolloProvider } from "@apollo/react-hooks"
import ApolloClient from "apollo-boost"
import React, { useState } from "react"
import { Dashboard, ProjectStatus } from "./Dashboard"
import { TotalStatusProvider } from "./TotalStatus"
import { settings, Settings, saveSettings } from "./storage"

export const App = () => {
  const [showSettings, setShowSettings] = useState(settings === undefined)

  return showSettings || !settings ? (
    <SettingsPage settings={settings ?? { accessToken: "" }} />
  ) : (
    <Dashboards
      settings={settings}
      showSettings={() => setShowSettings(true)}
    />
  )
}

const SettingsPage = (props: { settings: Partial<Settings> }) => {
  const [accessToken, setAccessToken] = useState(
    props.settings.accessToken ?? "",
  )
  const [config, setConfig] = useState(() =>
    props.settings.config
      ? JSON.stringify(props.settings.config, undefined, 2)
      : "",
  )

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        paddingBottom: 54,
        margin: "auto",
        height: "100vh",
        maxWidth: 600,
      }}
      onSubmit={e => {
        e.preventDefault()
        saveSettings({ accessToken, config: JSON.parse(config) })
      }}
    >
      <label htmlFor="accessToken">Gitlab Access Token</label>
      <input
        id="accessToken"
        name="accessToken"
        value={accessToken}
        onChange={e => setAccessToken(e.target.value)}
        style={{
          padding: "4px 8px",
          border: "none",
          borderRadius: 5,
          background: "rgba(255, 255, 255, 0.9)",
        }}
      />
      <label htmlFor="accessToken">Dashboard Config</label>
      <textarea
        id="config"
        name="config"
        value={config}
        onChange={e => setConfig(e.target.value)}
        style={{
          flex: 1,
          padding: 8,
          border: "none",
          borderRadius: 5,
          background: "rgba(255, 255, 255, 0.9)",
        }}
      />
      <button
        style={{
          alignSelf: "flex-end",
          marginTop: 32,
          padding: "8px 24px",
          fontSize: 18,
          border: "none",
          borderRadius: 5,
          color: "white",
          background: "rgba(255, 255, 255, 0.3)",
        }}
      >
        Save
      </button>
    </form>
  )
}

const Dashboards = (props: {
  settings: Settings
  showSettings: () => void
}) => {
  const [client] = useState(
    () =>
      new ApolloClient({
        uri: `${props.settings.config.gitlabUrl}/api/graphql`,
        headers: props.settings.accessToken
          ? {
              Authorization: `Bearer ${props.settings.accessToken}`,
            }
          : undefined,
      }),
  )

  return (
    <ApolloProvider client={client}>
      <TotalStatusProvider>
        {props.settings.config.dashboards.map(dashboard => (
          <>
            <button
              onClick={props.showSettings}
              style={{
                position: "fixed",
                top: 42,
                right: 42,
                padding: 0,
                border: "none",
                color: "white",
                background: "none",
              }}
            >
              Settings
            </button>
            <h1 style={{ paddingTop: 20, textAlign: "center" }}>
              {dashboard.name}
            </h1>
            <Dashboard columns={dashboard.columns}>
              {dashboard.widgets.map(widget => (
                <ProjectStatus projectPath={widget.projectPath} />
              ))}
            </Dashboard>
          </>
        ))}
      </TotalStatusProvider>
    </ApolloProvider>
  )
}
