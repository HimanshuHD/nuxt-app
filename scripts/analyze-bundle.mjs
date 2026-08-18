import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const outputRoot = join(process.cwd(), '.output', 'public')
const nuxtOutput = join(outputRoot, '_nuxt')
const reportPath = join(outputRoot, 'performance', 'bundle.json')
const sourceRoots = [join(process.cwd(), 'app'), join(process.cwd(), 'shared')]
const LARGE_ASSET_THRESHOLD = 250 * 1024

async function walk(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true })
    const files = []

    for (const entry of entries) {
      const path = join(directory, entry.name)

      if (entry.isDirectory()) {
        files.push(...(await walk(path)))
      } else {
        files.push(path)
      }
    }

    return files
  } catch {
    return []
  }
}

async function getFilesWithSizes(directory) {
  const files = await walk(directory)
  const result = []

  for (const path of files) {
    const fileStats = await stat(path)
    result.push({ path, bytes: fileStats.size })
  }

  return result
}

async function scanSource() {
  const files = []

  for (const root of sourceRoots) {
    files.push(...(await walk(root)))
  }

  let dynamicImports = 0
  let lazyComponents = 0

  for (const file of files) {
    if (!/\.(vue|ts|js)$/.test(file)) continue

    const source = await readFile(file, 'utf8')
    dynamicImports += (source.match(/\bimport\s*\(/g) ?? []).length
    lazyComponents += (source.match(/\bLazy[A-Z][A-Za-z0-9_]*/g) ?? []).length
  }

  return {
    dynamicImports,
    lazyComponents,
  }
}

async function main() {
  const files = await getFilesWithSizes(nuxtOutput)
  const javascript = files.filter(({ path }) => path.endsWith('.js'))
  const css = files.filter(({ path }) => path.endsWith('.css'))
  const assets = files.filter(
    ({ path }) => !path.endsWith('.js') && !path.endsWith('.css'),
  )
  const source = await scanSource()

  const javascriptBytes = javascript.reduce((total, file) => total + file.bytes, 0)
  const cssBytes = css.reduce((total, file) => total + file.bytes, 0)
  const assetBytes = assets.reduce((total, file) => total + file.bytes, 0)
  const largestJavascript = [...javascript].sort((a, b) => b.bytes - a.bytes)[0]

  const report = {
    generatedAt: new Date().toISOString(),
    javascript: {
      files: javascript.length,
      bytes: javascriptBytes,
      largestFile: largestJavascript
        ? {
            name: relative(nuxtOutput, largestJavascript.path),
            bytes: largestJavascript.bytes,
          }
        : null,
    },
    css: {
      files: css.length,
      bytes: cssBytes,
    },
    assets: {
      files: assets.length,
      bytes: assetBytes,
      largeFiles: assets.filter(
        (file) => file.bytes > LARGE_ASSET_THRESHOLD,
      ).length,
    },
    source,
  }

  await mkdir(join(outputRoot, 'performance'), { recursive: true })
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)

  console.log(`Performance report written to ${reportPath}`)
}

await main()
