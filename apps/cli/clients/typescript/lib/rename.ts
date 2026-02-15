import { readdir, stat, rename } from 'fs/promises'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const renameFiles = async (dir: string) => {
  const files = await readdir(dir)
  await Promise.all(files.map(async (file) => {
    const filePath = join(dir, file)
    const statResult = await stat(filePath)

    if (statResult.isDirectory()) {
      return renameFiles(filePath) 
    } else if (extname(file) === '.js') {
      const newFilePath = join(dir, file.replace(/\.js$/, '.mjs'))
      return rename(filePath, newFilePath) 
    }
  }))
}

renameFiles(join(__dirname, '..', 'dist'))