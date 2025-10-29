# EMU Alerts - Firebase Extensions Configuration

## Overview

Firebase Extensions automate common backend tasks. This guide outlines the recommended extensions for EMU Alerts and their configuration.

---

## 1. Incident Number Counter

**Extension**: Firestore Counter (or custom Cloud Function)

**Purpose**: Auto-increment `incidentNumber` field starting at 1000000

**Configuration**:

\`\`\`yaml
Collection Path: incidents
Field Name: incidentNumber
Start Value: 1000000
Increment By: 1
\`\`\`

**Implementation**:

Option A: Use Firestore Counter extension
- Install from Firebase Extensions marketplace
- Configure to watch `incidents` collection
- Set counter field to `incidentNumber`

Option B: Custom Cloud Function
\`\`\`typescript
// functions/src/index.ts
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

export const assignIncidentNumber = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snap, context) => {
    const counterRef = admin.firestore().doc('counters/incidents')
    
    await admin.firestore().runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef)
      const currentCount = counterDoc.exists ? counterDoc.data()!.count : 1000000
      const newCount = currentCount + 1
      
      transaction.set(counterRef, { count: newCount })
      transaction.update(snap.ref, { incidentNumber: newCount })
    })
  })
\`\`\`

**Security Notes**:
- Counter document should be read-only for clients
- Only Cloud Function can write to counter

---

## 2. Geocoding on Ingest

**Extension**: Custom Cloud Function using Google Geocoding API

**Purpose**: Convert `address` field to `lat` and `lng` coordinates

**Configuration**:

\`\`\`yaml
Collection Path: incidents
Trigger: onCreate, onUpdate (if address changes)
Input Field: address
Output Fields: lat, lng
Cache: Store in Firestore to avoid redundant API calls
\`\`\`

**Implementation**:

\`\`\`typescript
// functions/src/index.ts
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { Client } from '@googlemaps/google-maps-services-js'

const mapsClient = new Client({})

export const geocodeIncident = functions.firestore
  .document('incidents/{incidentId}')
  .onWrite(async (change, context) => {
    const newData = change.after.exists ? change.after.data() : null
    const oldData = change.before.exists ? change.before.data() : null
    
    // Only geocode if address changed and lat/lng not already set
    if (!newData || !newData.address || newData.lat || newData.lng) {
      return null
    }
    
    if (oldData && oldData.address === newData.address) {
      return null // Address unchanged
    }
    
    try {
      const response = await mapsClient.geocode({
        params: {
          address: newData.address,
          key: functions.config().google.maps_api_key,
        },
      })
      
      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location
        
        await change.after.ref.update({
          lat: location.lat,
          lng: location.lng,
        })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
    
    return null
  })
\`\`\`

**Environment Variables**:
\`\`\`bash
firebase functions:config:set google.maps_api_key="YOUR_API_KEY"
\`\`\`

**Security Notes**:
- API key should be server-side only
- Implement rate limiting to avoid quota exhaustion
- Cache geocoded results in Firestore

---

## 3. Send FCM on New Message / Incident Update

**Extension**: Custom Cloud Function with FCM

**Purpose**: Send push notifications when new messages arrive or incidents update

**Configuration**:

\`\`\`yaml
Triggers:
  - threads/{threadId}/messages/{messageId} onCreate
  - incidents/{incidentId} onUpdate (status change)
Topics:
  - /topics/incidents (all users)
  - /topics/incident-{incidentId} (users viewing specific incident)
\`\`\`

**Implementation**:

\`\`\`typescript
// functions/src/index.ts
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Send notification on new message
export const notifyNewMessage = functions.firestore
  .document('threads/{threadId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data()
    const threadId = context.params.threadId
    
    // Get thread to find participants
    const threadDoc = await admin.firestore().doc(`threads/${threadId}`).get()
    const thread = threadDoc.data()
    
    if (!thread) return null
    
    // Get sender profile
    const senderDoc = await admin.firestore().doc(`user_profiles/${message.senderId}`).get()
    const sender = senderDoc.data()
    
    // Send to all participants except sender
    const recipients = thread.participants.filter((id: string) => id !== message.senderId)
    
    const payload = {
      notification: {
        title: `${sender?.name || 'Someone'} sent a message`,
        body: message.text.substring(0, 100),
        icon: '/emergency-alerts-logo.png',
      },
      data: {
        type: 'message',
        threadId: threadId,
        messageId: snap.id,
      },
    }
    
    // Send to each recipient's FCM token
    for (const recipientId of recipients) {
      const userDoc = await admin.firestore().doc(`user_profiles/${recipientId}`).get()
      const user = userDoc.data()
      
      if (user?.fcmToken && user?.pushEnabled) {
        await admin.messaging().send({
          token: user.fcmToken,
          ...payload,
        })
      }
    }
    
    return null
  })

// Send notification on incident update
export const notifyIncidentUpdate = functions.firestore
  .document('incidents/{incidentId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data()
    const oldData = change.before.data()
    const incidentId = context.params.incidentId
    
    // Only notify if status changed
    if (newData.status === oldData.status) {
      return null
    }
    
    const payload = {
      notification: {
        title: `Incident #${newData.incidentNumber} Updated`,
        body: `Status changed to ${newData.status}`,
        icon: '/emergency-alerts-logo.png',
      },
      data: {
        type: 'incident_update',
        incidentId: incidentId,
      },
    }
    
    // Send to topic
    await admin.messaging().send({
      topic: `incident-${incidentId}`,
      ...payload,
    })
    
    return null
  })
\`\`\`

**Security Notes**:
- Store FCM tokens securely in user_profiles
- Respect user's `pushEnabled` preference
- Implement unsubscribe mechanism

---

## 4. Resize Images for Uploads

**Extension**: Resize Images (official Firebase Extension)

**Purpose**: Create thumbnails for uploaded photos

**Configuration**:

\`\`\`yaml
Cloud Storage bucket: {your-project-id}.appspot.com
Paths to watch: incidents/{incidentId}/files/*
Image sizes: 200x200, 400x400, 800x800
Deletion policy: Delete original after resize (optional)
\`\`\`

**Installation**:
\`\`\`bash
firebase ext:install storage-resize-images
\`\`\`

**Configuration Prompts**:
- Cloud Storage bucket: `{your-project-id}.appspot.com`
- Paths to watch: `incidents/{incidentId}/files/*`
- Sizes: `200x200,400x400,800x800`
- Output format: `jpg`
- Quality: `90`

**Usage in App**:
\`\`\`typescript
// When displaying images, use thumbnail
const thumbnailUrl = file.url.replace('.jpg', '_200x200.jpg')
\`\`\`

**Security Notes**:
- Ensure Storage security rules allow read access
- Consider deleting original large images to save storage costs

---

## 5. OCR for Document Text Extraction (Optional)

**Extension**: Custom Cloud Function with Google Vision API

**Purpose**: Extract text from uploaded documents for searchability

**Configuration**:

\`\`\`yaml
Collection Path: incidents/{incidentId}/files
Trigger: onCreate (type === 'document')
Input Field: url (Storage path)
Output Field: ocrText
\`\`\`

**Implementation**:

\`\`\`typescript
// functions/src/index.ts
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import vision from '@google-cloud/vision'

const visionClient = new vision.ImageAnnotatorClient()

export const extractTextFromDocument = functions.firestore
  .document('incidents/{incidentId}/files/{fileId}')
  .onCreate(async (snap, context) => {
    const file = snap.data()
    
    // Only process documents (not photos)
    if (file.type !== 'document') {
      return null
    }
    
    try {
      const [result] = await visionClient.textDetection(file.url)
      const detections = result.textAnnotations
      
      if (detections && detections.length > 0) {
        const extractedText = detections[0].description
        
        await snap.ref.update({
          ocrText: extractedText,
        })
      }
    } catch (error) {
      console.error('OCR error:', error)
    }
    
    return null
  })
\`\`\`

**Security Notes**:
- Vision API requires billing enabled
- Implement rate limiting
- Consider cost per OCR request

---

## Extension Deployment Checklist

- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Initialize Functions: `firebase init functions`
- [ ] Install dependencies in `/functions` directory
- [ ] Configure environment variables: `firebase functions:config:set`
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Test each extension with sample data
- [ ] Monitor logs: `firebase functions:log`
- [ ] Set up error alerting in Firebase Console

---

## Cost Considerations

| Extension | Pricing | Estimated Monthly Cost |
|-----------|---------|------------------------|
| Incident Counter | Cloud Functions invocations | ~$0.01 (free tier) |
| Geocoding | Google Maps Geocoding API | ~$5 per 1000 requests |
| FCM Notifications | Free (unlimited) | $0 |
| Resize Images | Cloud Functions + Storage | ~$1-5 depending on volume |
| OCR (optional) | Vision API | ~$1.50 per 1000 images |

**Total Estimated**: $10-20/month for moderate usage

---

## Monitoring & Debugging

1. **Cloud Functions Logs**:
   \`\`\`bash
   firebase functions:log
   \`\`\`

2. **Firebase Console**:
   - Go to Functions tab to see execution counts and errors
   - Check Storage tab for uploaded files
   - Check Firestore tab for data integrity

3. **Error Handling**:
   - All functions should have try/catch blocks
   - Log errors to Cloud Logging
   - Set up alerts for critical failures

---

## Next Steps

1. Deploy Cloud Functions for each extension
2. Test with sample data in Firestore
3. Verify notifications arrive on devices
4. Monitor costs in Firebase Console
5. Optimize functions for performance (cold starts, memory usage)
