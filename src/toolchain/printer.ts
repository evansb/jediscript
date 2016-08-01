import { Snapshot, ISnapshotError } from './common'

/**
 * Pretty print snapshot output message
 */
export function printErrorToString(
  snapshot: Snapshot,
  error: ISnapshotError
): string { 
  const lines = snapshot.code.split('\n')
  let header = `${error.message} (line ${error.line} col ${error.column})` // tslint:disable-line
  if (error.endLine) {
    header += ` - (line ${error.endLine} col ${error.endColumn})`
  }
  let affectedCode = ''
  const endLine = error.endLine || error.line
  for (var li = error.line; li <= endLine; ++li) { 
    const codeInLine = lines[li - 1]
    affectedCode += codeInLine + '\n'
    if (li === error.line) {
      const leftPadding = Array(error.column).join(' ')
      const rightPadding = Array(codeInLine.length - error.column + 1)
        .join('-')
      affectedCode += leftPadding + '^' + rightPadding + '\n'
    } else if (li === endLine) {
      const leftPadding = Array(error.endColumn).join('-')
      affectedCode += leftPadding + '^\n'
    }
  }
  affectedCode += '\n'
  return `${header}\n${affectedCode}`
}
