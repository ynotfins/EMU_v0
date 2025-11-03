/**
 * Lead Generation Service
 * 
 * Handles automatic lead capture from various sources:
 * - Radio scanner feeds
 * - Social media monitoring
 * - Web scraping
 * - SEO landing pages
 */

import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Lead, LeadSource } from "@/types/domain"

export interface LeadGenerationConfig {
  radioScannerEnabled: boolean
  socialMediaEnabled: boolean
  webScrapingEnabled: boolean
  seoTrackingEnabled: boolean
  autoConversionEnabled: boolean
  minimumLossThreshold: number // Minimum estimated loss to auto-qualify
}

const DEFAULT_CONFIG: LeadGenerationConfig = {
  radioScannerEnabled: false,
  socialMediaEnabled: false,
  webScrapingEnabled: false,
  seoTrackingEnabled: true,
  autoConversionEnabled: false,
  minimumLossThreshold: 25000 // $25k minimum
}

export class LeadGenerationService {
  private config: LeadGenerationConfig
  private isRunning = false

  constructor(config: Partial<LeadGenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Start the lead generation service
   */
  async start() {
    if (this.isRunning) {
      console.log("[LeadGeneration] Service already running")
      return
    }

    console.log("[LeadGeneration] Starting service...")
    this.isRunning = true

    // Start individual monitors based on config
    if (this.config.radioScannerEnabled) {
      this.startRadioScanner()
    }

    if (this.config.socialMediaEnabled) {
      this.startSocialMediaMonitor()
    }

    if (this.config.webScrapingEnabled) {
      this.startWebScraper()
    }

    console.log("[LeadGeneration] Service started")
  }

  /**
   * Stop the lead generation service
   */
  stop() {
    console.log("[LeadGeneration] Stopping service...")
    this.isRunning = false
  }

  /**
   * Create a new lead in Firestore
   */
  async createLead(
    source: LeadSource,
    leadData: Partial<Lead>,
    autoQualify = false
  ): Promise<string> {
    try {
      // Check for duplicates first
      const isDuplicate = await this.checkDuplicate(leadData)
      if (isDuplicate) {
        console.log("[LeadGeneration] Duplicate lead detected, skipping")
        return ""
      }

      const lead: Omit<Lead, "id"> = {
        source,
        status: autoQualify ? "qualified" : "new",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        contact: leadData.contact || {},
        incidentType: leadData.incidentType,
        incidentDate: leadData.incidentDate,
        damageDescription: leadData.damageDescription,
        estimatedLoss: leadData.estimatedLoss,
        insuranceCompany: leadData.insuranceCompany,
        policyNumber: leadData.policyNumber,
        claimNumber: leadData.claimNumber,
        notes: leadData.notes,
        sourceData: leadData.sourceData
      }

      const docRef = await addDoc(collection(db, "leads"), lead)
      console.log(`[LeadGeneration] Created lead ${docRef.id} from ${source}`)

      // Auto-qualify if meets criteria
      if (this.config.autoConversionEnabled && lead.estimatedLoss) {
        if (lead.estimatedLoss >= this.config.minimumLossThreshold) {
          console.log("[LeadGeneration] Auto-qualifying lead based on loss threshold")
          // Update status to qualified
          // In a real implementation, this would trigger notifications
        }
      }

      return docRef.id
    } catch (error) {
      console.error("[LeadGeneration] Error creating lead:", error)
      throw error
    }
  }

  /**
   * Check if a lead already exists based on contact info
   */
  private async checkDuplicate(leadData: Partial<Lead>): Promise<boolean> {
    if (!leadData.contact) return false

    const { phone, email, address } = leadData.contact

    // Check by phone number (most reliable)
    if (phone) {
      const phoneQuery = query(
        collection(db, "leads"),
        where("contact.phone", "==", phone),
        orderBy("createdAt", "desc"),
        limit(1)
      )
      const phoneResults = await getDocs(phoneQuery)
      if (!phoneResults.empty) {
        const lastLead = phoneResults.docs[0].data()
        const daysSinceLastLead = this.getDaysSince(lastLead.createdAt)
        // Consider duplicate if within 30 days
        if (daysSinceLastLead < 30) return true
      }
    }

    // Check by email
    if (email) {
      const emailQuery = query(
        collection(db, "leads"),
        where("contact.email", "==", email),
        orderBy("createdAt", "desc"),
        limit(1)
      )
      const emailResults = await getDocs(emailQuery)
      if (!emailResults.empty) {
        const lastLead = emailResults.docs[0].data()
        const daysSinceLastLead = this.getDaysSince(lastLead.createdAt)
        if (daysSinceLastLead < 30) return true
      }
    }

    return false
  }

  private getDaysSince(dateString: string): number {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Radio Scanner Integration
   * In production, this would connect to radio scanner APIs or SDR feeds
   */
  private async startRadioScanner() {
    console.log("[LeadGeneration] Starting radio scanner monitor...")

    // READY FOR LIVE API INTEGRATION
    // TODO: Connect to your radio scanner API or emergency dispatch feed
    // Example integration points:
    // - Broadcastify API
    // - Local emergency dispatch API
    // - Scanner radio feed service
    // - Software Defined Radio (SDR) feeds
    
    if (!this.isRunning || !this.config.radioScannerEnabled) return
    
    console.log("[LeadGeneration] Radio scanner ready for live API integration")
    // When you have live API credentials, implement the connection here
    // Example:
    // const scanner = new RadioScannerAPI({
    //   apiKey: process.env.SCANNER_API_KEY,
    //   frequencies: ['154.430', '154.445', '154.490']
    // })
    // scanner.on('dispatch', (dispatch) => {
    //   if (this.isFireIncident(dispatch.transcript)) {
    //     this.processRadioDispatch(dispatch)
    //   }
    // })
  }

  /**
   * Social Media Monitor
   * Monitors Twitter, Facebook, Instagram for fire incidents
   */
  private async startSocialMediaMonitor() {
    console.log("[LeadGeneration] Starting social media monitor...")

    // In production: Use Twitter API v2, Facebook Graph API, Instagram API
    // Search for keywords: "house fire", "fire damage", "fire department", etc.
    // Geofence to service area

    const checkSocialMedia = async () => {
      if (!this.isRunning || !this.config.socialMediaEnabled) return

      // READY FOR LIVE API INTEGRATION
      // TODO: Connect to social media APIs
      // - Twitter API v2 with streaming endpoint
      // - Facebook Graph API
      // - Instagram Basic Display API
      // Example:
      // const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN)
      // const stream = await twitterClient.v2.searchStream({
      //   'tweet.fields': ['created_at', 'geo', 'text'],
      //   'expansions': ['geo.place_id']
      // })
      // stream.on('data', (tweet) => {
      //   if (this.isFireIncidentPost(tweet.data.text)) {
      //     this.processSocialPost(tweet)
      //   }
      // })
      
      console.log("[LeadGeneration] Social media monitor ready for live API integration")

      // Check every 5 minutes
      setTimeout(checkSocialMedia, 300000)
    }

    setTimeout(checkSocialMedia, 10000)
  }

  /**
   * Web Scraper
   * Scrapes local news sites, fire department websites
   */
  private async startWebScraper() {
    console.log("[LeadGeneration] Starting web scraper...")

    // Target sites:
    // - Local news websites
    // - Fire department incident reports
    // - City/county emergency management pages

    const scrapeWebsites = async () => {
      if (!this.isRunning || !this.config.webScrapingEnabled) return

      // READY FOR LIVE WEB SCRAPING
      // TODO: Implement web scraping with real news sources
      // - Use Puppeteer or Playwright for dynamic sites
      // - RSS feed monitoring for news sites
      // - Fire department incident report APIs
      // Example:
      // const newsFeeds = [
      //   'https://philadelphia.com/rss/news',
      //   'https://firerescue1.com/rss',
      //   'https://phila.gov/fire/incidents/feed'
      // ]
      // for (const feed of newsFeeds) {
      //   const articles = await this.parseRSSFeed(feed)
      //   for (const article of articles) {
      //     if (this.isFireIncident(article.title + ' ' + article.description)) {
      //       this.processNewsArticle(article)
      //     }
      //   }
      // }
      
      console.log("[LeadGeneration] Web scraper ready for live implementation")

      // Check every hour
      setTimeout(scrapeWebsites, 3600000)
    }

    setTimeout(scrapeWebsites, 15000)
  }

  /**
   * Track SEO Landing Page Conversions
   */
  async trackSEOLead(formData: {
    name: string
    phone: string
    email?: string
    address?: string
    incidentType?: string
    message?: string
    landingPage: string
    keywords?: string[]
  }) {
    console.log("[LeadGeneration] Tracking SEO landing page lead")

    return this.createLead("seo_landing", {
      contact: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address
      },
      incidentType: formData.incidentType,
      damageDescription: formData.message,
      sourceData: {
        webUrl: formData.landingPage,
        keywords: formData.keywords
      }
    }, true) // Auto-qualify SEO leads
  }

  // Helper methods
  private isFireIncident(text: string): boolean {
    const keywords = [
      "structure fire", "house fire", "building fire", "working fire",
      "2nd alarm", "3rd alarm", "fire damage", "smoke damage"
    ]
    const lowerText = text.toLowerCase()
    return keywords.some(keyword => lowerText.includes(keyword))
  }

  private parseDispatch(transcript: string): {
    address?: string
    city?: string
    type?: string
  } {
    // Simple regex patterns for address extraction
    const addressMatch = transcript.match(/at (\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr))/i)
    
    return {
      address: addressMatch ? addressMatch[1] : undefined,
      type: transcript.includes("structure fire") ? "Structure Fire" : "Fire Incident"
    }
  }

  private isFireIncidentPost(text: string): boolean {
    const keywords = [
      "house fire", "home fire", "fire damage", "lost everything",
      "fire department", "firefighters", "devastating fire"
    ]
    const lowerText = text.toLowerCase()
    return keywords.some(keyword => lowerText.includes(keyword))
  }

  private extractFromSocialPost(text: string): {
    address?: string
    type?: string
  } {
    // Extract street names mentioned in social posts
    const streetMatch = text.match(/on ([A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd))/i)
    
    return {
      address: streetMatch ? streetMatch[1] : undefined,
      type: "Residential Fire"
    }
  }
}

// Export singleton instance
export const leadGenerationService = new LeadGenerationService()
