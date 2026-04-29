import { detect } from '../detectors/index.js'

export function runDetect(root: string): void {
  const meta = detect(root)
  console.log(JSON.stringify(meta, null, 2))
}
