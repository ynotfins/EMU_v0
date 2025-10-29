import { readdir, readFile } from "fs/promises"
import { join } from "path"

interface ComponentInfo {
  name: string
  path: string
  hasPropsExport: boolean
  propsType?: string
}

async function scanComponents(dir: string): Promise<ComponentInfo[]> {
  const components: ComponentInfo[] = []

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        // Skip ui directory for now (shadcn components)
        if (entry.name === "ui") continue

        const children = await scanComponents(fullPath)
        components.push(...children)
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        // Read file and check for Props export
        const content = await readFile(fullPath, "utf-8")

        const componentName = entry.name.replace(/\.(tsx|ts)$/, "")
        const hasPropsExport = /export\s+(interface|type)\s+\w+Props/.test(content)

        // Try to extract props type name
        const propsMatch = content.match(/export\s+(interface|type)\s+(\w+Props)/)
        const propsType = propsMatch ? propsMatch[2] : undefined

        components.push({
          name: componentName,
          path: fullPath,
          hasPropsExport,
          propsType,
        })
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error)
  }

  return components
}

async function main() {
  console.log("EMU Alerts - Component Verification\n")
  console.log("Scanning /components directory...\n")

  const componentsDir = join(process.cwd(), "components")
  const components = await scanComponents(componentsDir)

  console.log("Component | Props Export | Props Type")
  console.log("----------|--------------|------------")

  for (const component of components) {
    const propsStatus = component.hasPropsExport ? "✓" : "✗"
    const propsType = component.propsType || "N/A"
    console.log(`${component.name.padEnd(30)} | ${propsStatus.padEnd(12)} | ${propsType}`)
  }

  const missingProps = components.filter((c) => !c.hasPropsExport)

  console.log(`\nTotal components: ${components.length}`)
  console.log(`With Props export: ${components.length - missingProps.length}`)
  console.log(`Missing Props export: ${missingProps.length}`)

  if (missingProps.length > 0) {
    console.log("\nComponents missing Props export:")
    missingProps.forEach((c) => console.log(`  - ${c.name} (${c.path})`))
  }

  console.log("\nComponent verification complete.")
}

main().catch(console.error)
