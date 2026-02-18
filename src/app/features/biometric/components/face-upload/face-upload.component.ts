import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * FaceUploadComponent
 * 
 * Presentational component for face image upload with camera capture support.
 * Architecture Decision: Dumb component that emits file selection events.
 * 
 * Inputs: loading state
 * Outputs: file selection event, upload trigger event
 */
@Component({
  selector: 'app-face-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './face-upload.component.html',
  styleUrls: ['./face-upload.component.css']
})
export class FaceUploadComponent implements OnDestroy {
  @Input() loading = false;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() uploadTriggered = new EventEmitter<void>();

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  cameraMode = false;
  cameraActive = false;
  private stream: MediaStream | null = null;

  /**
   * Handle file input change
   */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.createPreview(this.selectedFile);
      this.fileSelected.emit(this.selectedFile);
    }
  }

  /**
   * Create image preview URL
   */
  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Trigger upload action
   */
  onUpload(): void {
    if (this.selectedFile) {
      this.uploadTriggered.emit();
    }
  }

  /**
   * Check if file is selected
   */
  get hasFile(): boolean {
    return this.selectedFile !== null;
  }

  /**
   * Toggle between upload and camera mode
   */
  setMode(camera: boolean): void {
    if (this.cameraMode === camera) return;
    
    this.stopCamera();
    this.cameraMode = camera;
    this.selectedFile = null;
    this.previewUrl = null;
  }

  /**
   * Start camera stream
   */
  async startCamera(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      this.cameraActive = true;
      
      // Wait for view to update, then assign stream
      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.stream;
        }
      }, 0);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  }

  /**
   * Stop camera stream
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.cameraActive = false;
  }

  /**
   * Capture photo from camera
   */
  capturePhoto(): void {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob and create file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-face.jpg', { type: 'image/jpeg' });
          this.selectedFile = file;
          this.previewUrl = canvas.toDataURL('image/jpeg');
          this.fileSelected.emit(file);
          this.stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  }

  /**
   * Retake photo - restart camera
   */
  retakePhoto(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.startCamera();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.stopCamera();
  }
}
