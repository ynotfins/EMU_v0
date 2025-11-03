import { NextRequest, NextResponse } from 'next/server'
import { leadGenerationService } from '@/lib/lead-generation'

// Service configuration state (in production, this would be in a database)
let serviceConfig = {
  isRunning: false,
  radioScannerEnabled: false,
  socialMediaEnabled: false,
  webScrapingEnabled: false,
  seoTrackingEnabled: true,
  autoConversionEnabled: false,
  minimumLossThreshold: 25000
}

export async function GET() {
  return NextResponse.json({
    status: serviceConfig.isRunning ? 'running' : 'stopped',
    config: serviceConfig,
    message: 'Lead generation service status'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config } = body

    switch (action) {
      case 'start':
        if (!serviceConfig.isRunning) {
          // Apply config if provided
          if (config) {
            serviceConfig = { ...serviceConfig, ...config }
          }
          
          // Start the service
          await leadGenerationService.start()
          serviceConfig.isRunning = true
          
          return NextResponse.json({
            success: true,
            message: 'Lead generation service started',
            config: serviceConfig
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'Service is already running'
          }, { status: 400 })
        }

      case 'stop':
        if (serviceConfig.isRunning) {
          leadGenerationService.stop()
          serviceConfig.isRunning = false
          
          return NextResponse.json({
            success: true,
            message: 'Lead generation service stopped'
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'Service is not running'
          }, { status: 400 })
        }

      case 'configure':
        if (config) {
          serviceConfig = { ...serviceConfig, ...config }
          
          // Restart service if running to apply new config
          if (serviceConfig.isRunning) {
            leadGenerationService.stop()
            await leadGenerationService.start()
          }
          
          return NextResponse.json({
            success: true,
            message: 'Configuration updated',
            config: serviceConfig
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'No configuration provided'
          }, { status: 400 })
        }

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use: start, stop, or configure'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('[API] Lead generation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
