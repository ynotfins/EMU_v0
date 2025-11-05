import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Notification schema
const notificationSchema = z.object({
  appName: z.string().optional(),
  receivedAt: z.string().optional(),
  receivedAtEpoch: z.string().optional(),
  title: z.string().optional(),
  message: z.string(),
  source: z.string().optional(),
});

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
    // Parse request body
    const body = await request.json();
    const notification = notificationSchema.parse(body);

    if (!notification.message || notification.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message field is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[Webhook] OPENROUTER_API_KEY is not configured');
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
    console.error('[Webhook] Error parsing incident:', error);

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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

