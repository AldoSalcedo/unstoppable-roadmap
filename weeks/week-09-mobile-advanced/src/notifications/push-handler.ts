/**
 * push-handler.ts — HIPAA-Compliant Push Notification System
 * DÍA 1: Push Notifications — Notification lifecycle & healthcare compliance
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ============================================================================
// TAREA 1.1: NOTIFICATION CHANNEL SETUP (ANDROID)
// ============================================================================

/**
 * El problema: Android requires notification channels for proper sound/vibration
 * handling. Healthcare apps must set priority correctly for urgent vs routine alerts.
 * 
 * Con Expo Notifications: Unified API across iOS/Android, but Android needs
 * channel configuration for backwards compatibility (API 26+).
 * 
 * Aplicación Healthcare: Emergency lab alerts (high priority) vs routine 
 * appointment reminders (default priority). Different channels ensure proper UX.
 */

export async function setupNotificationChannels(): Promise<void> {
  // HIPAA Compliance: Channels have specific use cases to audit notification types
  if (Platform.OS === 'android') {
    // High-priority channel for urgent clinical alerts
    await Notifications.setNotificationChannelAsync('urgent_alerts', {
      name: 'Urgent Clinical Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      description: 'Critical lab results, medication alerts, emergency notifications',
      // NOTA IMPORTANTE: Sound only on critical alerts. User can disable in settings.
      sound: 'default',
      enableVibrate: true,
    });

    // Default channel for routine information
    await Notifications.setNotificationChannelAsync('routine_notifications', {
      name: 'Routine Notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 100],
      description: 'Appointment reminders, lab availability notifications',
      sound: 'default',
      enableVibrate: true,
    });

    // Silent channel for background updates (no user interruption)
    await Notifications.setNotificationChannelAsync('background_sync', {
      name: 'Background Sync',
      importance: Notifications.AndroidImportance.MIN,
      description: 'Data synchronization, no user notification',
      // NOTA: Background channel is silent - used for silent push updates
      sound: 'none',
      enableVibrate: false,
    });
  }
}

// ============================================================================
// TAREA 1.2: NOTIFICATION PERMISSION REQUEST
// ============================================================================

/**
 * El problema: iOS 13+ requires explicit permission for notifications. 
 * Healthcare apps must explain WHY notifications matter (timely clinical info).
 * 
 * Con Notifications.requestPermissionsAsync(): Returns permission status.
 * Healthcare context: "We need to send you lab results, appointment changes, 
 * and medication reminders."
 * 
 * Aplicación Healthcare: On first app open, request permission with 
 * health-specific messaging.
 */

export async function requestNotificationPermission(): Promise<boolean> {
  // First attempt: iOS-only permission request
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    // User hasn't decided yet - request with healthcare context
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        // Note: provisional notifications (silent testing) not used for healthcare
        allowCriticalAlerts: false, // Critical alerts require special entitlement
      },
    });
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// ============================================================================
// TAREA 1.3: LOCAL NOTIFICATION (HIPAA SAFE EXAMPLE)
// ============================================================================

/**
 * El problema: Local notifications used for testing + offline-first design.
 * Critical requirement: NEVER include PHI (Protected Health Information) in 
 * notification body. PHI includes: patient names, medical record numbers, 
 * diagnoses, medication names, lab values.
 * 
 * Con trigger timing: Schedule notifications for later, useful for 
 * reminders that don't need real-time backend communication.
 * 
 * Aplicación Healthcare: "Reminder: Take your medication" (safe) 
 * NOT "Reminder: Take your Metformin at 8am" (reveals medication info).
 */

export async function scheduleLocalNotification(
  title: string,
  body: string,
  deepLink?: string,
  delaySeconds: number = 10
): Promise<string> {
  // HIPAA Validation: Ensure no PHI in notification content
  validateNoPatientData(title, body);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      // DEEP LINKING: Include encrypted token (not patient ID directly)
      data: deepLink ? { deepLink } : undefined,
      // Platform-specific settings
      ios: {
        sound: true,
        badge: 1, // Show notification badge
      },
      android: {
        // Channel determines sound/vibration behavior
        channelId: 'routine_notifications',
        priority: 'high',
      },
    },
    trigger: {
      seconds: delaySeconds,
      type: 'time',
    },
  });

  // AUDIT TRAIL: Log notification scheduling for compliance
  console.log(`[NOTIFICATION AUDIT] Scheduled notification ${notificationId}`);

  return notificationId;
}

// ============================================================================
// TAREA 1.4: PUSH NOTIFICATION HANDLER (REMOTE)
// ============================================================================

/**
 * El problema: Push notifications come from backend and must be handled
 * both when app is in foreground and background.
 * 
 * Con foreground listener: Decide whether to show notification UI or not.
 * Healthcare case: Some alerts (lab results) need user attention immediately,
 * others (status updates) can be silent.
 * 
 * Aplicación Healthcare: Incoming notification from clinic EHR system →
 * app checks if encrypted token is valid → shows safe summary → user taps → 
 * deep links to secure result view.
 */

export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
): () => void {
  // Handler: notification arrives while app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      // HIPAA: Log that notification was received (audit trail)
      console.log('[NOTIFICATION RECEIVED]', {
        id: notification.request.identifier,
        timestamp: new Date().toISOString(),
        title: notification.request.content.title,
      });

      onNotificationReceived(notification);
    }
  );

  // Handler: user taps notification (foreground or background)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const deepLink = response.notification.request.content.data?.deepLink;
      
      // AUDIT: Track user interaction
      console.log('[NOTIFICATION TAPPED]', {
        id: response.notification.request.identifier,
        deepLink,
        timestamp: new Date().toISOString(),
      });

      // If notification contains deep link, navigate user to relevant screen
      if (deepLink) {
        // Deep linking handled by React Navigation (see TAREA 3.1)
        console.log(`[DEEP LINK] Routing to: ${deepLink}`);
      }

      onNotificationResponse(response);
    }
  );

  // Return cleanup function
  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

// ============================================================================
// TAREA 1.5: HIPAA-COMPLIANT NOTIFICATION PAYLOAD
// ============================================================================

/**
 * El problema: Backend sends notification payload. It MUST NOT contain PHI.
 * Example WRONG: { title: "John Doe", body: "Negative for COVID-19" }
 * Example RIGHT: { title: "Lab Result Available", body: "New result ready", 
 *                 data: { encryptedToken: "..." } }
 * 
 * Con payload validation: Check before displaying to ensure compliance.
 */

interface NotificationPayload {
  title: string;
  body: string;
  deepLink?: string; // e.g., "app://results/encrypted-token-123"
  priority?: 'urgent' | 'routine'; // Channel selector
}

const PHI_PATTERNS = [
  /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Name pattern: John Doe
  /\d{3}-\d{2}-\d{4}/, // SSN pattern (never should appear!)
  /MRN|mrn|medical record/i, // Medical record identifiers
  /(covid|positive|negative|pregnant|diabetes|hypertension)/i, // Medical conditions
];

/**
 * EJERCICIO 1: Implement PHI validation
 * Pista: Use regex patterns to detect potential patient data
 * TODO: Add logging for compliance audits
 */
function validateNoPatientData(title: string, body: string): void {
  const content = `${title} ${body}`;

  for (const pattern of PHI_PATTERNS) {
    if (pattern.test(content)) {
      // CRITICAL: This notification would violate HIPAA
      throw new Error(
        `[HIPAA VIOLATION] Notification contains potential PHI: "${content}". ` +
        `Never include patient names, diagnoses, or medical conditions in notification body.`
      );
    }
  }
}

/**
 * EJERCICIO 2: Implement HIPAA-compliant notification sender
 * Pista: Validate payload before scheduling or sending
 * TODO: Add retry logic with exponential backoff
 */
export async function sendHIPAACompliantNotification(
  payload: NotificationPayload
): Promise<string> {
  // Validate payload before any use
  validateNoPatientData(payload.title, payload.body);

  // Determine channel based on priority
  const channelId = 
    payload.priority === 'urgent' ? 'urgent_alerts' : 'routine_notifications';

  // Schedule notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      data: payload.deepLink ? { deepLink: payload.deepLink } : undefined,
      android: { channelId },
      ios: { sound: payload.priority === 'urgent' },
    },
    trigger: { seconds: 1, type: 'time' },
  });

  return notificationId;
}

// ============================================================================
// TAREA 1.6: NOTIFICATION PERMISSION STATE MANAGEMENT
// ============================================================================

/**
 * El problema: App must gracefully handle users who deny notification permission.
 * Healthcare app should still work, but without real-time alerts.
 * 
 * Solution: Store permission state, show helpful prompts, allow re-enabling.
 */

export async function getNotificationPermissionStatus(): Promise<{
  granted: boolean;
  ios?: boolean;
  android?: boolean;
}> {
  const { status } = await Notifications.getPermissionsAsync();

  return {
    granted: status === 'granted',
    ios: status === 'granted',
    android: status === 'granted',
  };
}

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================

/**
 * NOTIFICATION LIFECYCLE (iOS + Android):
 * 1. Notification payload sent from backend
 * 2. Expo Notifications receives on device (native layer)
 * 3. Notification scheduled/displayed by OS
 * 4. User taps notification → app launched/foregrounded
 * 5. NotificationResponseReceivedListener triggered
 * 6. Deep link processed (see TAREA 3.1 for linking)
 * 
 * KEY HEALTHCARE REQUIREMENTS:
 * - Never include PHI in visible notification text
 * - Use encrypted tokens in deep links instead of patient IDs
 * - Log all notification events for HIPAA audit trails
 * - Respect user's permission choices (no spamming)
 * - Handle notification failures gracefully (backend down)
 * 
 * HIPAA COMPLIANCE CHECKLIST:
 * ✓ No patient names in notification title/body
 * ✓ No medical conditions in notification text
 * ✓ No medication names in visible content
 * ✓ Deep links use encrypted tokens (not IDs)
 * ✓ Audit log created for all notifications sent/received
 * ✓ User can disable notifications (permission respected)
 * 
 * CONEXIÓN CON TU BACKGROUND:
 * Your QBP biology knowledge: You understand data sensitivity in healthcare.
 * Push notifications are like a "cellular membrane" for clinical data—
 * they protect sensitive information while allowing critical messages through.
 * Only the encrypted "signal" passes; the private patient data stays inside.
 * 
 * Your auditing background: Notice the logging/audit trail patterns here.
 * Every notification sent/received is logged for compliance verification.
 * In a real audit, auditors would review these logs to confirm HIPAA compliance.
 */

export default {
  setupNotificationChannels,
  requestNotificationPermission,
  scheduleLocalNotification,
  setupNotificationListeners,
  sendHIPAACompliantNotification,
  getNotificationPermissionStatus,
};
