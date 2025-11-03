/**
 * Event Bus Implementation
 * 
 * Handles domain events and their subscribers.
 * Can be extended to use message queues in production.
 */

import { injectable } from 'inversify';
import { DomainEvent, IEventBus } from '@application/shared/interfaces/services.interface';

type EventHandler = (event: DomainEvent) => Promise<void>;

@injectable()
export class EventBus implements IEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private globalHandlers: EventHandler[] = [];

  /**
   * Publishes an event to all registered handlers
   */
  async publish(event: DomainEvent): Promise<void> {
    // Log event for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('📢 Domain Event:', {
        type: event.eventType,
        aggregateId: event.aggregateId,
        timestamp: event.occurredAt,
      });
    }

    // Execute global handlers
    const globalPromises = this.globalHandlers.map(handler => 
      this.executeHandler(handler, event)
    );

    // Execute specific event type handlers
    const handlers = this.handlers.get(event.eventType) || [];
    const specificPromises = handlers.map(handler => 
      this.executeHandler(handler, event)
    );

    // Wait for all handlers to complete
    await Promise.all([...globalPromises, ...specificPromises]);

    // In production, you might also:
    // - Publish to a message queue (AWS SQS, Google Pub/Sub)
    // - Store events in an event store
    // - Send to analytics service
  }

  /**
   * Subscribes to a specific event type
   */
  subscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  /**
   * Subscribes to all events
   */
  subscribeToAll(handler: EventHandler): void {
    this.globalHandlers.push(handler);
  }

  /**
   * Unsubscribes a handler from a specific event type
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    const filtered = handlers.filter(h => h !== handler);
    
    if (filtered.length > 0) {
      this.handlers.set(eventType, filtered);
    } else {
      this.handlers.delete(eventType);
    }
  }

  /**
   * Clears all subscriptions
   */
  clear(): void {
    this.handlers.clear();
    this.globalHandlers = [];
  }

  /**
   * Executes a handler with error handling
   */
  private async executeHandler(handler: EventHandler, event: DomainEvent): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      console.error(`Error handling event ${event.eventType}:`, error);
      
      // In production, you might want to:
      // - Send to error tracking service (Sentry)
      // - Retry with exponential backoff
      // - Store failed events for later processing
    }
  }
}

/**
 * Event handlers that can be registered with the event bus
 */
export class DomainEventHandlers {
  /**
   * Logs all domain events for audit purposes
   */
  static auditLogger: EventHandler = async (event: DomainEvent) => {
    // In production, store in audit log database
    console.log('Audit:', {
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      timestamp: event.occurredAt,
      data: event.eventData,
    });
  };

  /**
   * Updates analytics when incidents are created
   */
  static incidentAnalytics: EventHandler = async (event: DomainEvent) => {
    if (event.eventType !== 'IncidentCreated') return;
    
    // In production, send to analytics service
    // Example: Google Analytics, Mixpanel, Segment
    console.log('Analytics: New incident created', event.eventData);
  };

  /**
   * Sends notifications for critical events
   */
  static criticalEventNotifier: EventHandler = async (event: DomainEvent) => {
    const criticalEvents = ['IncidentCreated', 'ChaserEmergency', 'SystemError'];
    
    if (!criticalEvents.includes(event.eventType)) return;
    
    // In production, send to alerting service
    // Example: PagerDuty, Slack, Discord
    console.log('Critical Event Alert:', event);
  };
}
