import { readdir } from "fs/promises"
import { join } from "path"

interface RouteNode {
  path: string
  file: string
  children: RouteNode[]
}

async function scanDirectory(dir: string, basePath = ""): Promise<RouteNode[]> {
  const routes: RouteNode[] = []

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        // Handle route groups (auth), dynamic routes [id], and regular folders
        let routePath = entry.name

        if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
          // Route group - doesn't add to URL
          const children = await scanDirectory(fullPath, basePath)
          routes.push(...children)
          continue
        } else if (entry.name.startsWith("[") && entry.name.endsWith("]")) {
          // Dynamic route
          routePath = `:${entry.name.slice(1, -1)}`
        }

        const newBasePath = basePath + "/" + routePath
        const children = await scanDirectory(fullPath, newBasePath)

        routes.push({
          path: newBasePath,
          file: fullPath,
          children,
        })
      } else if (entry.name === "page.tsx") {
        // Found a page
        routes.push({
          path: basePath || "/",
          file: fullPath,
          children: [],
        })
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error)
  }

  return routes
}

function printRouteTree(routes: RouteNode[], indent = "") {
  for (const route of routes) {
    if (route.file.endsWith("page.tsx")) {
      console.log(`${indent}${route.path} → ${route.file}`)
    }

    if (route.children.length > 0) {
      printRouteTree(route.children, indent + "  ")
    }
  }
}

async function main() {
  console.log("EMU Alerts - Route Tree\n")
  console.log("Scanning /app directory...\n")

  const appDir = join(process.cwd(), "app")
  const routes = await scanDirectory(appDir)

  printRouteTree(routes)

  console.log("\nRoute scan complete.")
}

main().catch(console.error)
