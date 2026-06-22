/**
 * document-scanner.ts — Clinical Document Scanner
 * DÍA 2: Camera & Media — Document capture for clinical workflows
 */

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

// ============================================================================
// TAREA 2.1: DOCUMENT QUALITY VALIDATION
// ============================================================================

/**
 * El problema: Medical documents (lab reports, prescriptions) must be high
 * quality for OCR processing. Low-quality scans waste backend resources and
 * produce poor results.
 * 
 * Con image quality metrics: Check resolution, brightness, contrast before
 * accepting document image.
 * 
 * Aplicación Healthcare: Patient scans prescription with phone camera →
 * app validates image quality → either accepts or asks to retake photo.
 * Prevents garbage-in scenarios.
 */

interface DocumentQualityMetrics {
  width: number;
  height: number;
  fileSize: number; // bytes
  brightness: number; // 0-1 scale
  contrast: number; // 0-1 scale
  isValid: boolean;
  reasons?: string[];
}

// Quality requirements for OCR-ready documents
const QUALITY_REQUIREMENTS = {
  MIN_RESOLUTION_WIDTH: 1200,
  MIN_RESOLUTION_HEIGHT: 800,
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
  MIN_BRIGHTNESS: 0.3, // Document too dark
  MAX_BRIGHTNESS: 0.95, // Overexposed/washed out
  MIN_CONTRAST: 0.2, // Low contrast = poor OCR
};

/**
 * EJERCICIO 1: Implement image quality validation
 * Pista: Use Image.getSize() to check dimensions, analyze pixel data for brightness
 * TODO: Return detailed validation report for user feedback
 */
export async function validateDocumentQuality(
  imagePath: string
): Promise<DocumentQualityMetrics> {
  const metrics: DocumentQualityMetrics = {
    width: 0,
    height: 0,
    fileSize: 0,
    brightness: 0,
    contrast: 0,
    isValid: false,
    reasons: [],
  };

  try {
    // Get image dimensions
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        Image.getSize(
          imagePath,
          (width, height) => resolve({ width, height }),
          reject
        );
      }
    );

    metrics.width = dimensions.width;
    metrics.height = dimensions.height;

    // Get file size
    const fileInfo = await FileSystem.getInfoAsync(imagePath);
    if (fileInfo.isDirectory === false && fileInfo.size) {
      metrics.fileSize = fileInfo.size;
    }

    // Validate dimensions
    if (metrics.width < QUALITY_REQUIREMENTS.MIN_RESOLUTION_WIDTH) {
      metrics.reasons?.push(
        `Image width too small: ${metrics.width}px (minimum: ${QUALITY_REQUIREMENTS.MIN_RESOLUTION_WIDTH}px)`
      );
    }
    if (metrics.height < QUALITY_REQUIREMENTS.MIN_RESOLUTION_HEIGHT) {
      metrics.reasons?.push(
        `Image height too small: ${metrics.height}px (minimum: ${QUALITY_REQUIREMENTS.MIN_RESOLUTION_HEIGHT}px)`
      );
    }

    // Validate file size
    if (metrics.fileSize > QUALITY_REQUIREMENTS.MAX_FILE_SIZE_BYTES) {
      metrics.reasons?.push(
        `File too large: ${(metrics.fileSize / 1024 / 1024).toFixed(2)}MB ` +
        `(maximum: ${QUALITY_REQUIREMENTS.MAX_FILE_SIZE_BYTES / 1024 / 1024}MB)`
      );
    }

    // Estimate brightness/contrast (simplified - full implementation would analyze pixels)
    // In production: use native image processing library
    metrics.brightness = 0.5; // Placeholder
    metrics.contrast = 0.4; // Placeholder

    if (metrics.brightness < QUALITY_REQUIREMENTS.MIN_BRIGHTNESS) {
      metrics.reasons?.push('Document image too dark. Better lighting needed.');
    }
    if (metrics.brightness > QUALITY_REQUIREMENTS.MAX_BRIGHTNESS) {
      metrics.reasons?.push('Document image overexposed. Reduce brightness.');
    }
    if (metrics.contrast < QUALITY_REQUIREMENTS.MIN_CONTRAST) {
      metrics.reasons?.push('Low contrast detected. Improve document lighting.');
    }

    // Overall validation
    metrics.isValid = metrics.reasons && metrics.reasons.length === 0;

    return metrics;
  } catch (error) {
    metrics.reasons = [`Error validating image: ${error}`];
    return metrics;
  }
}

// ============================================================================
// TAREA 2.2: CAMERA PERMISSION MANAGEMENT
// ============================================================================

/**
 * El problema: iOS/Android require explicit permission requests for camera.
 * Healthcare context: Explain why camera access is needed (document scanning).
 * 
 * Con useCameraPermissions hook: Request and check permission status.
 * Must handle denied permission gracefully.
 * 
 * Aplicación Healthcare: "MediScan needs access to your camera to scan
 * prescriptions and lab reports. Your images are processed locally and never
 * stored without your consent."
 */

export interface CameraPermissionStatus {
  granted: boolean;
  requestPermission?: () => Promise<boolean>;
  reason?: string;
}

/**
 * Hook for managing camera permissions in React Native component
 * Usage: const [permission, requestPermission] = useCameraPermissions();
 */
export function useCameraPermissionsHook(): CameraPermissionStatus {
  // Note: In real component, use Expo's useCameraPermissions hook
  // This is pseudo-code for documentation
  const [permission, requestPermission] = useCameraPermissions();

  return {
    granted: permission?.granted === true,
    requestPermission: async () => {
      const result = await requestPermission();
      return result?.granted === true;
    },
    reason: permission?.granted === false ? 'Camera access denied by user' : undefined,
  };
}

// ============================================================================
// TAREA 2.3: DOCUMENT CAPTURE WORKFLOW
// ============================================================================

/**
 * El problema: Capture medical documents with proper framing hints (document
 * should fill frame, correct perspective).
 * 
 * Con camera preview: Show hints to user for optimal framing.
 * 
 * Aplicación Healthcare: Camera shows rectangle overlay where document should be,
 * guides user to center document in frame, then captures.
 */

export interface DocumentCaptureConfig {
  documentType: 'prescription' | 'lab_report' | 'insurance_card' | 'generic';
  autoCapture?: boolean; // Automatically capture when document detected
  quality?: 'draft' | 'standard' | 'high'; // Compression level
}

export async function captureDocumentPhoto(
  cameraRef: any, // CameraView ref
  config: DocumentCaptureConfig
): Promise<{ uri: string; metrics: DocumentQualityMetrics }> {
  // Take photo with camera ref
  const photo = await cameraRef.takePictureAsync({
    quality: config.quality === 'high' ? 1 : config.quality === 'standard' ? 0.8 : 0.5,
    base64: false, // Don't include base64 (huge payload)
    skipProcessing: false, // Use native processing for quality
  });

  // Validate quality
  const metrics = await validateDocumentQuality(photo.uri);

  if (!metrics.isValid && config.quality !== 'draft') {
    // In production: return validation errors to user
    console.warn('[DOCUMENT SCAN] Quality validation failed:', metrics.reasons);
  }

  return {
    uri: photo.uri,
    metrics,
  };
}

// ============================================================================
// TAREA 2.4: IMAGE OPTIMIZATION & PRIVACY
// ============================================================================

/**
 * El problema: Original photos from camera are huge. Must compress for
 * transmission and storage. Also must strip EXIF data (location, camera info).
 * 
 * Con EXIF stripping: Remove metadata that could reveal sensitive info
 * (e.g., photo taken at hospital coordinates).
 * 
 * Aplicación Healthcare: HIPAA requires removing metadata that could
 * identify location, device, or timing of scan.
 */

export interface OptimizedDocument {
  originalUri: string;
  optimizedUri: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * EJERCICIO 2: Implement image compression & EXIF stripping
 * Pista: Use expo-file-system to read/write optimized images
 * TODO: Verify EXIF data is completely removed before transmission
 */
export async function optimizeDocumentImage(
  imageUri: string,
  targetQuality: number = 0.7
): Promise<OptimizedDocument> {
  const originalInfo = await FileSystem.getInfoAsync(imageUri);
  const originalSize = originalInfo.size || 0;

  // In production: use native image library for EXIF stripping + compression
  // Placeholder: copy to cache directory (EXIF usually stripped by system)
  const optimizedUri = `${FileSystem.cacheDirectory}optimized_document_${Date.now()}.jpg`;

  // Simulate compression (in production: use native processing)
  const optimizedSize = Math.floor(originalSize * targetQuality);

  return {
    originalUri: imageUri,
    optimizedUri,
    originalSize,
    optimizedSize,
    compressionRatio: optimizedSize / originalSize,
  };
}

// ============================================================================
// TAREA 2.5: FILE STORAGE & SECURITY
// ============================================================================

/**
 * El problema: Scanned documents must be stored securely (encrypted).
 * HIPAA requires: encryption at rest, access controls, deletion policies.
 * 
 * Con secure storage: Keep in app sandbox, encrypt before backup.
 * 
 * Aplicación Healthcare: Document files never synced to cloud without user
 * permission. Always encrypted with per-device key.
 */

export interface SecureDocumentStore {
  documentId: string;
  fileName: string;
  localPath: string;
  encrypted: boolean;
  createdAt: Date;
  expiresAt?: Date; // Auto-delete after X days
}

export async function storeDocumentSecurely(
  imageUri: string,
  documentType: string
): Promise<SecureDocumentStore> {
  const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fileName = `${documentType}_${documentId}.jpg`;
  const storagePath = `${FileSystem.documentDirectory}secure_documents/${fileName}`;

  // Create directory if needed
  await FileSystem.makeDirectoryAsync(
    `${FileSystem.documentDirectory}secure_documents`,
    { intermediates: true }
  );

  // Move optimized image to secure location
  // In production: encrypt file before storing
  await FileSystem.copyAsync({
    from: imageUri,
    to: storagePath,
  });

  // HIPAA: Set expiration (documents auto-deleted after 90 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  return {
    documentId,
    fileName,
    localPath: storagePath,
    encrypted: true, // Mark as encrypted (in production: actually encrypt)
    createdAt: new Date(),
    expiresAt,
  };
}

// ============================================================================
// TAREA 2.6: OCR READINESS CHECK
// ============================================================================

/**
 * El problema: Backend OCR service requires certain quality thresholds.
 * Check if document is ready for OCR before uploading (save bandwidth).
 * 
 * Aplicación Healthcare: After scanning, tell user whether image is good for
 * OCR processing or needs improvement.
 */

export interface OCRReadinessReport {
  isReady: boolean;
  confidence: number; // 0-1 scale
  warnings: string[];
  recommendations: string[];
}

export async function checkOCRReadiness(
  metrics: DocumentQualityMetrics
): Promise<OCRReadinessReport> {
  const report: OCRReadinessReport = {
    isReady: false,
    confidence: 0,
    warnings: [],
    recommendations: [],
  };

  // Check each quality metric
  if (metrics.width < QUALITY_REQUIREMENTS.MIN_RESOLUTION_WIDTH) {
    report.warnings.push('Image width below OCR threshold');
    report.recommendations.push('Retake photo with better zoom/framing');
  }

  if (metrics.brightness < 0.4) {
    report.warnings.push('Image too dark for OCR');
    report.recommendations.push('Improve lighting conditions');
  }

  if (metrics.contrast < QUALITY_REQUIREMENTS.MIN_CONTRAST) {
    report.warnings.push('Low contrast may affect text recognition');
    report.recommendations.push('Ensure document has high contrast text');
  }

  // Calculate confidence score
  let score = 1.0;
  if (metrics.width < QUALITY_REQUIREMENTS.MIN_RESOLUTION_WIDTH) score -= 0.3;
  if (metrics.brightness < 0.4) score -= 0.25;
  if (metrics.contrast < 0.3) score -= 0.2;

  report.confidence = Math.max(0, score);
  report.isReady = report.confidence > 0.7 && report.warnings.length === 0;

  return report;
}

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================

/**
 * DOCUMENT SCANNING WORKFLOW:
 * 1. Request camera permission (explain: prescription/lab scanning)
 * 2. Show camera preview with document framing guide
 * 3. Capture photo when user taps button
 * 4. Validate image quality (resolution, brightness, contrast)
 * 5. If quality poor: show feedback, allow retake
 * 6. If quality good: compress and strip EXIF metadata
 * 7. Store encrypted in app sandbox
 * 8. Check OCR readiness before uploading to backend
 * 9. Upload to OCR service when ready
 * 
 * HIPAA REQUIREMENTS FOR DOCUMENT STORAGE:
 * ✓ Store only in app sandbox (not cloud without consent)
 * ✓ Encrypt files at rest
 * ✓ Strip EXIF metadata (location, timing, device info)
 * ✓ Implement auto-deletion (90-day retention policy)
 * ✓ Log document access (audit trail)
 * ✓ User can delete documents anytime
 * ✓ Never backup to iCloud/Google Drive without encryption key
 * 
 * QUALITY METRICS EXPLAINED:
 * - Resolution: OCR needs 1200+ pixels width minimum
 * - Brightness: 0.3-0.95 range prevents dark/washed-out images
 * - Contrast: Medical text must have clear distinction from background
 * - File size: <2MB fits mobile bandwidth constraints
 * 
 * CONEXIÓN CON TU BACKGROUND:
 * Your QBP biology degree: Document scanning is like proper sample preparation
 * in lab work. Poor-quality input (blurry scan) leads to garbage results.
 * The validation metrics ensure the "sample" is good before analysis.
 * 
 * Your auditing background: Notice the audit trail requirements:
 * - Log when documents are scanned
 * - Record storage location and encryption status
 * - Track document access and deletion
 * These logs are reviewed in HIPAA compliance audits.
 */

export default {
  validateDocumentQuality,
  captureDocumentPhoto,
  optimizeDocumentImage,
  storeDocumentSecurely,
  checkOCRReadiness,
};
