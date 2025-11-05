import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

type Credentials = {
  baseUrl?: string
  testAccount: { email: string; password: string }
}

async function main() {
  const configPath = path.resolve('tests/credentials.yaml')
  if (!fs.existsSync(configPath)) {
    console.error('[e2e-login] Missing tests/credentials.yaml')
    process.exit(1)
  }

  const raw = fs.readFileSync(configPath, 'utf8')
  const cfg = yaml.parse(raw) as Credentials

  const baseUrl = process.env.TEST_BASE_URL || cfg.baseUrl || 'http://localhost:3000'
  const { email, password } = cfg.testAccount

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  console.log(`[e2e-login] Navigating to ${baseUrl}/login`)
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' })

  // Reveal email form
  const emailBtn = page.getByRole('button', { name: /sign in with email/i })
  if (await emailBtn.isVisible().catch(() => false)) {
    await emailBtn.click()
  }

  // Fill credentials
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder('Password').fill(password)

  await page.getByRole('button', { name: /^sign in$/i }).click()

  // Wait for redirect to role home
  await page.waitForLoadState('networkidle')

  const url = page.url()
  console.log('[e2e-login] Final URL:', url)
  if (!/\/supe\/incidents|\/chaser\/incidents/.test(url)) {
    throw new Error('Login did not redirect to incidents page')
  }

  console.log('[e2e-login] ✅ Login successful')
  await browser.close()
}

main().catch((err) => {
  console.error('[e2e-login] ❌ Failed:', err)
  process.exit(1)
})


