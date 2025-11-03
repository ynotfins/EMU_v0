/**
 * Push Notification Service
 * 
 * Handles push notifications via Firebase Cloud Messaging (FCM).
 */

import { injectable } from 'inversify';
import { adminMessaging, adminDb } from '../firebase/config/firebase-admin.config';
import { INotificationService } from '@application/shared/interfaces/services.interface';
import { Incident } from '@domain/entities/incident/incident.entity';
import { Location } from '@domain/shared/value-objects';
import { Either, left, right } from '@domain/shared/errors';
import { 
  Message,
  MulticastMessage,
  BatchResponse
} from 'firebase-admin/messaging';

interface NotificationToken {
  userId: string;
  token: string;
  platform: 'web' | 'ios' | 'android';
  updatedAt: Date;
}

@injectable()
export class NotificationService implements INotificationService {
  private readonly tokensCollection = 'notification_tokens';

  /**
   * Notifies all active Supes and nearby Chasers about a new incident
   */
  async notifyNewIncident(incident: Incident, location: Location): Promise<Either<Error, void>> {
    try {
      // Get all active Supes
      const supesQuery = await adminDb
        .collection('users')
        .where('role', 'in', ['supe', 'admin', 'super_admin'])
        .where('status', '==', 'active')
        .where('settings.notificationsEnabled', '==', true)
        .get();

      const supeIds = supesQuery.docs.map(doc => doc.id);

      // Get nearby active Chasers (within 50km by default)
      const chasersQuery = await adminDb
        .collection('users')
        .where('role', '==', 'chaser')
        .where('status', '==', 'active')
        .where('settings.notificationsEnabled', '==', true)
        .get();

      const nearbyChaseIds: string[] = [];
      
      // Filter chasers by distance
      for (const doc of chasersQuery.docs) {
        const data = doc.data();
        if (data.lastLocation && data.settings.maxResponseDistance) {
          const distance = this.calculateDistance(
            location.lat,
            location.lng,
            data.lastLocation.lat,
            data.lastLocation.lng
          );
          
          if (distance <= (data.settings.maxResponseDistance || 50)) {
            nearbyChaseIds.push(doc.id);
          }
        }
      }

      // Get all notification tokens
      const userIds = [...supeIds, ...nearbyChaseIds];
      const tokens = await this.getTokensForUsers(userIds);

      if (tokens.length === 0) {
        return right(undefined);
      }

      // Prepare notification
      const notification = this.buildIncidentNotification(incident, location);

      // Send multicast message
      const message: MulticastMessage = {
        ...notification,
        tokens: tokens.map(t => t.token),
      };

      const response = await adminMessaging.sendEachForMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        await this.handleFailedTokens(tokens, response);
      }

      return right(undefined);
    } catch (error) {
      console.error('Failed to send incident notifications:', error);
      return left(new Error('Failed to send notifications'));
    }
  }

  /**
   * Notifies a chaser when they are assigned to an incident
   */
  async notifyChaserAssigned(userId: string, incidentId: string): Promise<Either<Error, void>> {
    try {
      const tokens = await this.getTokensForUsers([userId]);
      
      if (tokens.length === 0) {
        return right(undefined);
      }

      // Get incident details
      const incidentDoc = await adminDb
        .collection('incidents')
        .doc(incidentId)
        .get();

      if (!incidentDoc.exists) {
        return left(new Error('Incident not found'));
      }

      const incidentData = incidentDoc.data()!;

      const message: MulticastMessage = {
        notification: {
          title: '🚨 You\'ve Been Assigned!',
          body: `New ${incidentData.type} incident at ${incidentData.location.address}`,
        },
        data: {
          type: 'chaser_assigned',
          incidentId: incidentId,
          incidentType: incidentData.type,
          priority: incidentData.priority,
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'OPEN_INCIDENT',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: '🚨 You\'ve Been Assigned!',
                body: `New ${incidentData.type} incident at ${incidentData.location.address}`,
              },
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            icon: '/app-icon.png',
            badge: '/badge-icon.png',
            requireInteraction: true,
          },
        },
        tokens: tokens.map(t => t.token),
      };

      await adminMessaging.sendEachForMulticast(message);
      return right(undefined);
    } catch (error) {
      console.error('Failed to send assignment notification:', error);
      return left(new Error('Failed to send notification'));
    }
  }

  /**
   * Notifies users about an incident update
   */
  async notifyIncidentUpdate(
    userIds: string[], 
    incidentId: string, 
    update: string
  ): Promise<Either<Error, void>> {
    try {
      const tokens = await this.getTokensForUsers(userIds);
      
      if (tokens.length === 0) {
        return right(undefined);
      }

      const message: MulticastMessage = {
        notification: {
          title: '📝 Incident Update',
          body: update,
        },
        data: {
          type: 'incident_update',
          incidentId: incidentId,
        },
        android: {
          priority: 'normal',
          notification: {
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: '📝 Incident Update',
                body: update,
              },
              sound: 'default',
            },
          },
        },
        webpush: {
          notification: {
            icon: '/app-icon.png',
          },
        },
        tokens: tokens.map(t => t.token),
      };

      await adminMessaging.sendEachForMulticast(message);
      return right(undefined);
    } catch (error) {
      console.error('Failed to send update notifications:', error);
      return left(new Error('Failed to send notifications'));
    }
  }

  /**
   * Saves or updates a user's FCM token
   */
  async saveUserToken(
    userId: string, 
    token: string, 
    platform: 'web' | 'ios' | 'android'
  ): Promise<Either<Error, void>> {
    try {
      await adminDb
        .collection(this.tokensCollection)
        .doc(`${userId}_${platform}`)
        .set({
          userId,
          token,
          platform,
          updatedAt: new Date(),
        });

      return right(undefined);
    } catch (error) {
      return left(new Error('Failed to save notification token'));
    }
  }

  /**
   * Removes a user's FCM token
   */
  async removeUserToken(userId: string, platform: string): Promise<Either<Error, void>> {
    try {
      await adminDb
        .collection(this.tokensCollection)
        .doc(`${userId}_${platform}`)
        .delete();

      return right(undefined);
    } catch (error) {
      return left(new Error('Failed to remove notification token'));
    }
  }

  /**
   * Gets notification tokens for specified users
   */
  private async getTokensForUsers(userIds: string[]): Promise<NotificationToken[]> {
    if (userIds.length === 0) {
      return [];
    }

    const tokens: NotificationToken[] = [];
    
    // Firestore 'in' queries are limited to 10 items
    const chunks = this.chunkArray(userIds, 10);
    
    for (const chunk of chunks) {
      const tokensQuery = await adminDb
        .collection(this.tokensCollection)
        .where('userId', 'in', chunk)
        .get();

      tokensQuery.docs.forEach(doc => {
        const data = doc.data();
        tokens.push({
          userId: data.userId,
          token: data.token,
          platform: data.platform,
          updatedAt: data.updatedAt.toDate(),
        });
      });
    }

    return tokens;
  }

  /**
   * Builds notification message for a new incident
   */
  private buildIncidentNotification(incident: Incident, location: Location): Partial<Message> {
    const priorityEmoji: Record<string, string> = {
      low: '🟢',
      medium: '🟡', 
      high: '🟠',
      critical: '🔴',
    };

    const emoji = priorityEmoji[incident.priority] || '🚨';
    
    return {
      notification: {
        title: `${emoji} New ${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Alert`,
        body: `${incident.description.substring(0, 100)} - ${location.address}`,
      },
      data: {
        type: 'new_incident',
        incidentId: incident.id.value,
        incidentType: incident.type,
        priority: incident.priority,
        lat: location.lat.toString(),
        lng: location.lng.toString(),
      },
      android: {
        priority: incident.priority === 'critical' || incident.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: 'default',
          clickAction: 'OPEN_INCIDENT',
          channelId: `incident_${incident.priority}`,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: `${emoji} New ${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Alert`,
              body: `${incident.description.substring(0, 100)} - ${location.address}`,
            },
            sound: incident.priority === 'critical' ? 'critical_alert.caf' : 'default',
            badge: 1,
            category: 'INCIDENT_ALERT',
          },
        },
      },
      webpush: {
        notification: {
          icon: '/app-icon.png',
          badge: '/badge-icon.png',
          requireInteraction: incident.priority === 'critical' || incident.priority === 'high',
          actions: [
            {
              action: 'view',
              title: 'View',
            },
            {
              action: 'respond',
              title: 'Respond',
            },
          ],
        },
      },
    };
  }

  /**
   * Handles failed tokens by removing invalid ones
   */
  private async handleFailedTokens(
    tokens: NotificationToken[], 
    response: BatchResponse
  ): Promise<void> {
    const failedTokens: NotificationToken[] = [];
    
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error) {
        const errorCode = resp.error.code;
        
        // Remove invalid tokens
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          failedTokens.push(tokens[idx]);
        }
      }
    });

    // Remove invalid tokens from database
    for (const token of failedTokens) {
      await this.removeUserToken(token.userId, token.platform);
    }
  }

  /**
   * Calculates distance between two coordinates in kilometers
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
