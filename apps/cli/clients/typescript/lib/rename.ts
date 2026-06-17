import { readdir, stat, readFile, writeFile, unlink } from 'fs/promises'
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
      let content = await readFile(filePath, 'utf-8')
      
      // Replace static and dynamic imports/exports from '.js' to '.mjs'
      content = content.replace(/(\b(?:from|import|export)\s+|import\()(['"])([^'"]+)\.js\2/g, (match, p1, p2, p3) => {
        return `${p1}${p2}${p3}.mjs${p2}`;
      })

      const newFilePath = join(dir, file.replace(/\.js$/, '.mjs'))
      await writeFile(newFilePath, content, 'utf-8')
      await unlink(filePath)
    }
  }))
}

renameFiles(join(__dirname, '..', 'dist'))