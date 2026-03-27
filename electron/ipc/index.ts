import { registerFileHandlers } from './fileHandlers'
import { registerExportHandlers } from './exportHandlers'

export function registerAllHandlers() {
  registerFileHandlers()
  registerExportHandlers()
}
