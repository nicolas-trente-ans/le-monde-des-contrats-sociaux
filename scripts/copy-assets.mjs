import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'assets')
const target = join(root, 'public', 'assets')

if (!existsSync(source)) {
  console.warn('No assets/ directory found, skipping copy.')
  process.exit(0)
}

mkdirSync(join(root, 'public'), { recursive: true })
rmSync(target, { recursive: true, force: true })
cpSync(source, target, { recursive: true })
console.log('Copied assets/ -> public/assets/')
