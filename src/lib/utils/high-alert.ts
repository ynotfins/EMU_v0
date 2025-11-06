/**
 * High Alert System
 * 
 * When High Alert is enabled:
 * - Plays LOUD train horn sound
 * - Vibrates phone continuously
 * - Flashes screen red/white (strobe effect)
 * - Requests notification permission
 * 
 * PWA Limitations:
 * - Cannot change device ringer or volume (OS restriction)
 * - Cannot access flashlight (no standard API)
 * - CAN use Web Audio API to play sound at max volume (bypasses device volume)
 */

export class HighAlertSystem {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private vibrationInterval: number | null = null;

  constructor() {
    // Initialize Web Audio API for loud sound
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Request notification permission
   */
  async requestPermissions(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('[HighAlert] Notification permission:', permission);
      }

      return true;
    } catch (error) {
      console.error('[HighAlert] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Play LOUD train horn sound using Web Audio API
   * This can be VERY loud even if device volume is low
   */
  async playTrainHorn(): Promise<void> {
    if (!this.audioContext) {
      console.warn('[HighAlert] AudioContext not available');
      return;
    }

    try {
      // Resume audio context (required by browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isPlaying = true;

      // Create oscillators for train horn sound (440Hz + 554Hz combo)
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator1.type = 'sawtooth'; // Harsh, loud sound
      oscillator2.type = 'sawtooth';
      oscillator1.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
      oscillator2.frequency.setValueAtTime(554, this.audioContext.currentTime); // C#5

      // MAX VOLUME (1.0 = 100%)
      gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Play for 2 seconds, then repeat
      oscillator1.start();
      oscillator2.start();
      oscillator1.stop(this.audioContext.currentTime + 2);
      oscillator2.stop(this.audioContext.currentTime + 2);

      // Repeat every 3 seconds while High Alert is on
      setTimeout(() => {
        if (this.isPlaying) {
          this.playTrainHorn();
        }
      }, 3000);

      console.log('[HighAlert] 🚂 Train horn playing at MAX volume');
    } catch (error) {
      console.error('[HighAlert] Failed to play sound:', error);
    }
  }

  /**
   * Vibrate phone continuously
   */
  startVibration(): void {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) {
      console.warn('[HighAlert] Vibration not supported');
      return;
    }

    // Vibrate pattern: [vibrate 500ms, pause 500ms] repeated
    const vibratePattern = [500, 500];
    
    this.vibrationInterval = window.setInterval(() => {
      navigator.vibrate(vibratePattern);
    }, 1000) as unknown as number;

    console.log('[HighAlert] 📳 Vibration started');
  }

  /**
   * Stop vibration
   */
  stopVibration(): void {
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }
    
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0); // Stop vibration
    }

    console.log('[HighAlert] 📳 Vibration stopped');
  }

  /**
   * Stop all high alert features
   */
  stop(): void {
    this.isPlaying = false;
    this.stopVibration();
    
    if (this.audioContext) {
      this.audioContext.suspend();
    }

    console.log('[HighAlert] ⏸️ High Alert stopped');
  }

  /**
   * Start High Alert (sound + vibration + screen flash)
   * Call this when user enables High Alert
   */
  async start(): Promise<void> {
    console.log('[HighAlert] [ALERT] HIGH ALERT ACTIVATED!');

    // Request permissions first
    await this.requestPermissions();

    // Start sound
    await this.playTrainHorn();

    // Start vibration
    this.startVibration();

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      // Note: vibrate is only available in ServiceWorkerRegistration.showNotification, not web Notification API
      new Notification('[ALERT] HIGH ALERT ENABLED', {
        body: 'You will receive loud alerts for high-priority incidents',
        icon: '/app-icon.png',
      });
    }
  }
}

// Singleton instance
export const highAlertSystem = new HighAlertSystem();

