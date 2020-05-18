import { useQuery } from "@apollo/react-hooks"
import { gql } from "apollo-boost"
import React, { ReactNode } from "react"
import { useSetProjectStatus } from "./TotalStatus"
import { getIcon } from "./icons/icons"

export type ColumnConfig = { count?: number | string; width?: number }

export const Dashboard = ({
  children,
  columns = {},
}: {
  children: ReactNode
  columns?: ColumnConfig
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns.count ??
          "auto-fit"}, ${columns.width ?? 230}px)`,
        gridGap: 40,
        padding: 40,
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  )
}

const projectStatusQuery = gql`
  query projectStatus($fullPath: ID!) {
    project(fullPath: $fullPath) {
      name
      webUrl
      environments {
        nodes {
          name
        }
      }
      repository {
        tree {
          lastCommit {
            title
            webUrl
            author {
              avatarUrl
              name
            }
          }
        }
      }
      pipelines(first: 1) {
        nodes {
          status
          detailedStatus {
            label
            detailsPath
          }
          finishedAt
        }
      }
    }
  }
`

export const ProjectStatus = ({ projectPath }: { projectPath: string }) => {
  const setProjectStatus = useSetProjectStatus()
  const query = useQuery(projectStatusQuery, {
    variables: { fullPath: projectPath },
    pollInterval: 10000,
  })

  if (query.error)
    return (
      <p>
        Error fetching project status:
        <pre>
          <code>{`${query.error}`}</code>
        </pre>
      </p>
    )
  if (query.loading) return <p>Loading...</p>

  const project = query.data.project
  if (!project) return <p>Missing project {projectPath}</p>

  setProjectStatus(projectPath, project.pipelines.nodes[0].status)

  const webUrl = new URL(project.webUrl)

  return (
    <div
      style={{
        display: "grid",
        alignContent: "start",
        gridGap: 8,
        gridTemplateRows: "min-content 1fr min-content",
      }}
    >
      <a
        href={project.webUrl}
        target="gitlab"
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, flex: 1 }}>{project.name}</h3>
        <a
          href={`${webUrl.protocol}//${webUrl.host}${project.pipelines.nodes[0].detailedStatus.detailsPath}`}
          target="gitlab"
          style={{
            marginLeft: 8,
            width: 20,
            height: 20,
            backgroundImage: `url(${getIcon(
              project.pipelines.nodes[0].status,
            )})`,
            backgroundSize: "contain",
          }}
        >
          <span style={{ visibility: "hidden" }}>
            {project.pipelines.nodes[0].detailedStatus.label}
          </span>
        </a>
      </a>
      <a
        href={`${project.repository.tree.lastCommit.webUrl}`}
        target="gitlab"
        style={{ opacity: 0.9 }}
      >
        {project.repository.tree.lastCommit.title}
      </a>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <img
          src={`${webUrl.protocol}//${webUrl.host}${project.repository.tree.lastCommit.author?.avatarUrl}`}
          alt=""
          style={{
            marginRight: 8,
            width: 32,
            height: 32,
            borderRadius: "50%",
          }}
        />
        {project.repository.tree.lastCommit.author?.name}
      </div>
    </div>
  )
}
