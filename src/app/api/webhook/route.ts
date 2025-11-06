import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase-client';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { logger } from '@/lib/utils/logger';

// Notification schema
const notificationSchema = z.object({
  appName: z.string().optional(),
  receivedAt: z.string().optional(),
  receivedAtEpoch: z.string().optional(),
  title: z.string().optional(),
  message: z.string(),
  source: z.string().optional(),
  authToken: z.string().optional(), // Optional: can be in header or body
});

/**
 * Rate limiting for webhook endpoint
 * Simple in-memory rate limiter (for production, use Redis or Upstash)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  // Try various headers for IP (handles proxies/CDNs)
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  );
}

/**
 * Retrieve webhook secret from Google Cloud Secret Manager
 */
async function getWebhookSecret(): Promise<string> {
  // Check cache first
  if (cachedWebhookSecret && Date.now() < secretCacheExpiry) {
    return cachedWebhookSecret;
  }

  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('Project ID not configured. Set FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    }

    const secretName = '4axe-com_webhook';
    const client = new SecretManagerServiceClient();
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    logger.debug(`Retrieving secret from Secret Manager`, {
      code: 'Webhook',
      secretName,
    });

    const [version] = await client.accessSecretVersion({ name });
    const secretValue = version.payload?.data?.toString() || '';

    if (!secretValue) {
      throw new Error(`Secret ${secretName} is empty`);
    }

    // Cache the secret
    cachedWebhookSecret = secretValue.trim();
    secretCacheExpiry = Date.now() + SECRET_CACHE_TTL;

    logger.info(`Secret retrieved and cached successfully`, {
      code: 'Webhook',
    });
    return cachedWebhookSecret;
  } catch (error) {
    logger.error('Failed to retrieve secret from Secret Manager', error, {
      code: 'Webhook',
    });
    throw error;
  }
}

/**
 * Authenticate incoming webhook request
 * Checks headers first, then optionally accepts body authToken
 */
async function authenticateRequest(request: NextRequest, bodyAuthToken?: string): Promise<boolean> {
  try {
    // Get the expected secret from Secret Manager
    const expectedSecret = await getWebhookSecret();

    // Check Authorization header first (Bearer token)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token === expectedSecret) {
        return true;
      }
    }

    // Check X-Webhook-Token header
    const webhookToken = request.headers.get('x-webhook-token');
    if (webhookToken && webhookToken.trim() === expectedSecret) {
      return true;
    }

    // Check request body authToken if provided
    if (bodyAuthToken && bodyAuthToken.trim() === expectedSecret) {
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Authentication error', error, {
      code: 'Webhook',
    });
    return false;
  }
}

// Cache for the webhook secret to avoid repeated Secret Manager calls
let cachedWebhookSecret: string | null = null;
let secretCacheExpiry: number = 0;
const SECRET_CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

// Incident schema (for AI parsing)
const incidentSchema = z.object({
  type: z
    .string()
    .describe(
      'The type of incident, formatted with proper capitalization (e.g., "Fall Victim Incident", "Proximity Alert", "New Incident", "Apparatus Accident")'
    ),
  distance: z
    .number()
    .nonnegative()
    .optional()
    .describe('Distance in miles if available (e.g., 0.79 for proximity alerts)'),
  state: z.string().describe('State abbreviation (e.g., "NJ")'),
  county: z
    .string()
    .describe('County name with proper capitalization (e.g., "Monmouth", "Hudson")'),
  city: z
    .string()
    .describe('City name with proper capitalization (e.g., "Fair Haven", "Union City")'),
  address: z
    .string()
    .describe('Street address with proper formatting (e.g., "19 Highland Ave", "132 41st St")'),
  description: z
    .string()
    .describe(
      'Detailed description of the incident, formatted with proper grammar, capitalization, punctuation, and expanded abbreviations where appropriate (e.g., "PD O/S" -> "Police Department on scene")'
    ),
  emergencyServicesStatus: z
    .string()
    .optional()
    .describe(
      'Status of emergency services, formatted in full readable text (e.g., "PD O/S" -> "Police Department On Scene", "PD off" -> "Police Department Cleared")'
    ),
  incidentId: z
    .string()
    .optional()
    .describe('Incident ID if mentioned (e.g., "#1835340" or "1835340")'),
  source: z.string().optional().describe('Source reference (e.g., "BNN | BNNDESK/njc4283")'),
  timestamp: z.string().optional().describe('Timestamp if available in the message'),
});

type Incident = z.infer<typeof incidentSchema>;

// Helper function to parse timestamp
function parseTimestamp(timestampStr: string | undefined): { date: string; time: string } {
  if (!timestampStr) {
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
    };
  }

  try {
    const date = new Date(timestampStr);
    if (!isNaN(date.getTime())) {
      return {
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().split(' ')[0].substring(0, 5),
      };
    }
  } catch {}

  const now = new Date();
  return {
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0].substring(0, 5),
  };
}

// Map parsed incident to Firestore format matching app schema
function mapToFirestoreIncident(parsedIncident: Incident, notificationReceivedAt?: string) {
  const timestamp = parsedIncident.timestamp || notificationReceivedAt;
  const { date, time } = parseTimestamp(timestamp);
  
  // Determine priority based on type and description
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  const typeLower = parsedIncident.type?.toLowerCase() || '';
  const descLower = parsedIncident.description?.toLowerCase() || '';
  
  if (typeLower.includes('critical') || typeLower.includes('emergency') || descLower.includes('critical')) {
    priority = 'critical';
  } else if (typeLower.includes('fire') || typeLower.includes('accident') || typeLower.includes('medical')) {
    priority = 'high';
  } else if (typeLower.includes('proximity') || typeLower.includes('alert')) {
    priority = 'low';
  }

  // Create title from type and location
  const title = `${parsedIncident.type}${parsedIncident.city ? ` - ${parsedIncident.city}` : ''}`;

  return {
    // Match app schema
    title,
    type: parsedIncident.type.toLowerCase().includes('fire') ? 'fire' : 
          parsedIncident.type.toLowerCase().includes('medical') ? 'medical' :
          parsedIncident.type.toLowerCase().includes('accident') ? 'accident' :
          parsedIncident.type.toLowerCase().includes('hazard') ? 'hazard' : 'other',
    priority,
    level: priority === 'critical' ? 'high' : priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low',
    address: parsedIncident.address,
    city: parsedIncident.city,
    state: parsedIncident.state,
    county: parsedIncident.county,
    lat: parsedIncident.latitude,
    lng: parsedIncident.longitude,
    description: parsedIncident.description,
    source: parsedIncident.source,
    isActive: true,
    isSilenced: false,
    isFavorited: false,
    isBookmarked: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updates: [],
    responses: [],
    
    // Legacy fields for compatibility
    incidentId: parsedIncident.incidentId?.replace('#', '') || undefined,
    incidentNumber: parsedIncident.incidentId?.replace('#', '') || `${Date.now()}`,
    message: parsedIncident.description,
    highAlert: priority === 'critical' || priority === 'high',
    emergencyServicesStatus: parsedIncident.emergencyServicesStatus,
    distance: parsedIncident.distance || 0,
    date,
    time,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      logger.warn('Rate limit exceeded', {
        code: 'Webhook',
        ip: clientIP,
      });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    logger.debug('POST request received', {
      code: 'Webhook',
      ip: clientIP,
      method: request.method,
      url: request.url,
    });
    
    // Parse request body first
    const body = await request.json();
    logger.debug('Request body parsed', {
      code: 'Webhook',
      messageLength: body.message?.length || 0,
    });
    
    // Authenticate request (check headers and body authToken)
    const isAuthenticated = await authenticateRequest(request, body.authToken);
    if (!isAuthenticated) {
      logger.warn('Unauthorized request attempt', {
        code: 'Webhook',
        ip: clientIP,
      });
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing authentication token.' },
        { status: 401 }
      );
    }

    // Validate notification schema
    const notification = notificationSchema.parse(body);

    if (!notification.message || notification.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message field is required and cannot be empty' },
        { status: 400 }
      );
    }

    logger.info('Authenticated request received', {
      code: 'Webhook',
      source: notification.source || 'unknown',
    });

    // Check for API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      logger.error('OPENROUTER_API_KEY is not configured', undefined, {
        code: 'Webhook',
      });
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY secret is not configured' },
        { status: 500 }
      );
    }

    // Initialize OpenRouter
    const openrouter = createOpenRouter({
      apiKey,
    });

    const model = openrouter('meta-llama/llama-3.2-3b-instruct');

    // Parse incident using AI
    const result = await generateObject({
      model,
      specificationVersion: 'v2',
      schema: incidentSchema,
      prompt: `You are an expert at parsing emergency notification messages and formatting them beautifully for display.

Your task is to parse the following emergency notification message and extract structured incident data with beautiful formatting.

EMERGENCY NOTIFICATION MESSAGE:
${notification.message}

EXTRACTION REQUIREMENTS:
Extract all available information from the message. The message may contain:
• Incident type (e.g., Fall Victim, Proximity Alert, Apparatus Accident, Fire, Medical Emergency)
• Location details: state (abbreviation), county, city, and street address
• Distance (for proximity alerts, in miles)
• Detailed description of what happened
• Emergency services status (often abbreviated)
• Incident ID (may include # symbol)
• Source/reference information
• Timestamp or time information

FORMATTING REQUIREMENTS (CRITICAL - ALL FIELDS MUST BE BEAUTIFULLY FORMATTED):

1. **Type Field**:
   - Use proper title case and clear, descriptive wording
   - Example: "Fall Victim" → "Fall Victim Incident"
   - Example: "Proximity Alert" → "Proximity Alert"
   - Example: "Apparatus Accident" → "Apparatus Accident"

2. **Location Fields**:
   - State: Keep as abbreviation (e.g., "NJ", "NY", "CA")
   - County: Proper title case (e.g., "Monmouth County", "Hudson County")
   - City: Proper title case (e.g., "Fair Haven", "Union City")
   - Address: Clean formatting (e.g., "19 Highland Ave", "132 41st St")

3. **Description Field**:
   - Expand all abbreviations to full, readable text
   - Use proper grammar, punctuation, and capitalization
   - Make it flow naturally as a complete sentence
   - Common abbreviations to expand:
     • "PD O/S" → "Police Department on scene"
     • "FD O/S" → "Fire Department on scene"
     • "EMS O/S" → "Emergency Medical Services on scene"
     • "O/S" → "on scene"
     • "PD off" → "Police Department cleared"
     • "25-30 feet" → "25 to 30 feet"
   - Example: "PD O/S with a subject fell 25-30 feet out of a tree, conscious and alert" 
     → "Police Department on scene with a subject who fell 25 to 30 feet out of a tree, conscious and alert"

4. **Emergency Services Status**:
   - Convert abbreviations to full, professional, readable text
   - Examples:
     • "PD O/S" → "Police Department On Scene"
     • "PD off" → "Police Department Cleared"
     • "FD O/S" → "Fire Department On Scene"
     • "EMS O/S" → "Emergency Medical Services On Scene"
     • "safety 1" → "Safety 1"

5. **Incident ID**:
   - Remove or keep the # symbol consistently
   - Format as: "1835340" or "#1835340"

6. **Source**:
   - Keep as-is, but ensure clean formatting

OUTPUT REQUIREMENTS:
- All fields must be beautifully formatted and ready for display
- Use proper grammar, punctuation, and capitalization throughout
- Expand abbreviations naturally into full, readable text
- If a field is not present in the message, omit it (use optional fields)
- Maintain accuracy - don't add information that isn't in the message
- Format all text to be professional and easy to read

Now parse and format the message according to these requirements.`,
      temperature: 0.1,
    });

    const parsedIncident = result.object;
    const firestoreIncident = mapToFirestoreIncident(parsedIncident, notification.receivedAt);

    // Check if incident already exists by incidentId
    let incidentDocId: string;
    let isUpdate = false;

    if (firestoreIncident.incidentId) {
      const existingQuery = query(
        collection(db, 'incidents'),
        where('incidentId', '==', firestoreIncident.incidentId)
      );
      
      const existingDocs = await getDocs(existingQuery);

      if (!existingDocs.empty) {
        incidentDocId = existingDocs.docs[0].id;
        isUpdate = true;

        // Update existing incident
        const existingData = existingDocs.docs[0].data();
        const updateData = {
          ...firestoreIncident,
          createdAt: existingData.createdAt, // Preserve original creation time
          updatedAt: serverTimestamp(),
        };

        await updateDoc(doc(db, 'incidents', incidentDocId), updateData);
      } else {
        // Create new incident
        const docRef = await addDoc(collection(db, 'incidents'), firestoreIncident);
        incidentDocId = docRef.id;
      }
    } else {
      // Create new incident without incidentId
      const docRef = await addDoc(collection(db, 'incidents'), firestoreIncident);
      incidentDocId = docRef.id;
    }

    return NextResponse.json({
      success: true,
      data: parsedIncident,
      firestore: {
        id: incidentDocId,
        action: isUpdate ? 'updated' : 'created',
      },
      notification: {
        appName: notification.appName,
        receivedAt: notification.receivedAt,
        title: notification.title,
        source: notification.source,
      },
    });
  } catch (error) {
    logger.error('Error parsing incident', error, {
      code: 'Webhook',
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to parse incident data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Token',
    },
  });
}

// Handle unsupported methods with helpful error message
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests. Please use POST method.',
      allowedMethods: ['POST', 'OPTIONS'],
    },
    {
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

// Handle PUT, PATCH, DELETE with helpful error
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests.',
      allowedMethods: ['POST', 'OPTIONS'],
    },
    {
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests.',
      allowedMethods: ['POST', 'OPTIONS'],
    },
    {
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests.',
      allowedMethods: ['POST', 'OPTIONS'],
    },
    {
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

