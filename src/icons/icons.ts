import successIcon from "./successIcon.svg"
import failedIcon from "./failedIcon.svg"
import inProgressIcon from "./inProgressIcon.svg"

export const getIcon = (...statuses: string[]) =>
  statuses.some(status => status === "FAILED")
    ? failedIcon
    : statuses.some(
        status =>
          status === "CREATED" ||
          status === "WAITING_FOR_RESOURCE" ||
          status === "PREPARING" ||
          status === "RUNNING",
      )
    ? inProgressIcon
    : successIcon
