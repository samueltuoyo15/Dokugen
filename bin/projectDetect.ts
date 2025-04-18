import fs from "fs-extra"
import path from "path"

type DetectionPattern = {
  files?: string[]
  folders?: string[]
  contents?: {
    file: string
    keywords: string[]
  }[]
  packageJson?: {
    dependencies?: string[]
    devDependencies?: string[]
    scripts?: string[]
  }
}

type ProjectType = {
  type: string
  category: 'frontend' | 'backend' | 'mobile' | 'desktop' | 'devops' | 'other'
  confidence: number
}

const detectionPatterns: Record<string, DetectionPattern> = {
  // JavaScript Frameworks
  'React': {
    files: ['src/App.jsx', 'src/App.tsx'],
    folders: ['src/components'],
    packageJson: {
      dependencies: ['react'],
      devDependencies: ['react-scripts']
    }
  },
  'Next.js': {
    files: ['next.config.js', 'next.config.ts'],
    packageJson: {
      dependencies: ['next']
    }
  },
  'Vue.js': {
    files: ['src/App.vue', 'vue.config.js'],
    packageJson: {
      dependencies: ['vue']
    }
  },
  'Angular': {
    files: ['angular.json', 'src/main.ts'],
    packageJson: {
      dependencies: ['@angular/core']
    }
  },
  'Svelte': {
    files: ['svelte.config.js', 'src/main.svelte'],
    packageJson: {
      dependencies: ['svelte']
    }
  },
  
  // Mobile Frameworks
  'React Native': {
    files: ['metro.config.js', 'App.js', 'App.tsx'],
    packageJson: {
      dependencies: ['react-native']
    }
  },
  'Flutter': {
    files: ['pubspec.yaml', 'lib/main.dart']
  },
  'Ionic': {
    packageJson: {
      dependencies: ['@ionic/core']
    }
  },
  
  // Backend Frameworks
  'Express.js': {
    files: ['app.js', 'server.js'],
    packageJson: {
      dependencies: ['express']
    }
  },
  'NestJS': {
    packageJson: {
      dependencies: ['@nestjs/core']
    }
  },
  'Django': {
    files: ['manage.py', 'requirements.txt'],
    folders: ['templates']
  },
  'Flask': {
    files: ['app.py', 'requirements.txt'],
    contents: [{
      file: 'app.py',
      keywords: ['Flask', '@app.route']
    }]
  },
  'Ruby on Rails': {
    files: ['Gemfile', 'config.ru'],
    contents: [{
      file: 'Gemfile',
      keywords: ['rails']
    }]
  },
  'Laravel': {
    files: ['artisan', 'server.php'],
    packageJson: {
      dependencies: ['laravel-mix']
    }
  },
  
  // Programming Languages
  'TypeScript': {
    files: ['tsconfig.json'],
    packageJson: {
      devDependencies: ['typescript']
    }
  },
  'Python': {
    files: ['requirements.txt', 'pyproject.toml', 'setup.py']
  },
  'Java': {
    files: ['pom.xml', 'build.gradle']
  },
  'Go': {
    files: ['go.mod', 'main.go']
  },
  'Rust': {
    files: ['Cargo.toml']
  },
  'C#': {
    files: ['.csproj', 'Program.cs']
  },
  'PHP': {
    files: ['composer.json', 'index.php']
  },
  'Ruby': {
    files: ['Gemfile', 'config.ru']
  },
  
  // Build Tools 
  'Docker': {
    files: ['Dockerfile']
  },
  'Kubernetes': {
    folders: ['k8s'],
    files: ['deployment.yaml']
  },
  'Terraform': {
    files: ['main.tf', 'variables.tf']
  },
  'Serverless': {
    files: ['serverless.yml']
  }
}

export const detectProjectType = async (projectDir: string): Promise<string> => {
  const detectedTypes: ProjectType[] = []
  
  // Check all detection patterns
  for (const [type, pattern] of Object.entries(detectionPatterns)) {
    let confidence = 0
    
    // Check for files
    if (pattern.files) {
      for (const file of pattern.files) {
        if (await fs.pathExists(path.join(projectDir, file))) {
          confidence += 30
          break
        }
      }
    }
    
    // Check for folders
    if (pattern.folders) {
      for (const folder of pattern.folders) {
        if (await fs.pathExists(path.join(projectDir, folder))) {
          confidence += 20
          break
        }
      }
    }
    
    // Check file contents
    if (pattern.contents) {
      for (const contentCheck of pattern.contents) {
        const filePath = path.join(projectDir, contentCheck.file)
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf-8')
          if (contentCheck.keywords.some(kw => content.includes(kw))) {
            confidence += 25
          }
        }
      }
    }
    
    // Check package.json
    if (pattern.packageJson) {
      const packageJsonPath = path.join(projectDir, 'package.json')
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath)
        
        // Check dependencies
        if (pattern.packageJson.dependencies) {
          const deps = packageJson.dependencies || {}
          if (pattern.packageJson.dependencies.some(dep => deps[dep])) {
            confidence += 25
          }
        }
        
        // Check devDependencies
        if (pattern.packageJson.devDependencies) {
          const devDeps = packageJson.devDependencies || {}
          if (pattern.packageJson.devDependencies.some(dep => devDeps[dep])) {
            confidence += 15
          }
        }
        
        // Check scripts
        if (pattern.packageJson.scripts) {
          const scripts = packageJson.scripts || {}
          if (pattern.packageJson.scripts.some(script => scripts[script])) {
            confidence += 10
          }
        }
      }
    }
    
    if (confidence > 0) {
      detectedTypes.push({
        type,
        category: getCategory(type),
        confidence
      })
    }
  }
  
  // Sort by confidence and return the most likely type
  if (detectedTypes.length > 0) {
    detectedTypes.sort((a, b) => b.confidence - a.confidence)
    return detectedTypes[0].type
  }
  
  return 'Unknown'
}

const getCategory = (type: string): ProjectType['category'] => {
  if (['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js'].includes(type)) return 'frontend'
  if (['Express.js', 'NestJS', 'Django', 'Flask', 'Ruby on Rails', 'Laravel'].includes(type)) return 'backend'
  if (['React Native', 'Flutter', 'Ionic'].includes(type)) return 'mobile'
  if (['Electron', 'Tauri'].includes(type)) return 'desktop'
  if (['Docker', 'Kubernetes', 'Terraform', 'Serverless'].includes(type)) return 'devops'
  return 'other'
}