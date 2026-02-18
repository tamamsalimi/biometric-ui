import { Component, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SpeechUploadComponent
 * 
 * Presentational component for speech/audio upload with recording support.
 * Records audio in WAV format for backend compatibility.
 * Max file size: 1MB (backend limit)
 * 
 * Inputs: loading state
 * Outputs: file selection event, upload trigger event
 */
@Component({
  selector: 'app-speech-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speech-upload.component.html',
  styleUrls: ['./speech-upload.component.css']
})
export class SpeechUploadComponent implements OnDestroy {
  @Input() loading = false;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() uploadTriggered = new EventEmitter<void>();

  selectedFile: File | null = null;
  recordMode = false;
  isRecording = false;
  recordingTime = 0;
  fileSizeError: string | null = null;
  
  private audioContext: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private audioData: Float32Array[] = [];
  private recordingTimer: any = null;
  private stream: MediaStream | null = null;
  
  // Use 16kHz sample rate for smaller file sizes (good for speech)
  private sampleRate = 16000;
  // Max file size 1MB
  private readonly MAX_FILE_SIZE = 1048576;
  // Max recording time ~30 seconds (16kHz * 2 bytes * 30s ≈ 960KB)
  private readonly MAX_RECORDING_TIME = 30;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  /**
   * Handle file input change
   */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        this.fileSizeError = `File too large (${this.formatBytes(file.size)}). Maximum size is 1 MB.`;
        this.selectedFile = null;
        return;
      }
      
      this.fileSizeError = null;
      this.selectedFile = file;
      this.fileSelected.emit(this.selectedFile);
    }
  }

  /**
   * Trigger upload action
   */
  onUpload(): void {
    if (this.selectedFile) {
      console.log('Uploading file:', this.selectedFile.name, this.selectedFile.type, this.selectedFile.size);
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
   * Format file size for display
   */
  get fileSizeFormatted(): string {
    if (!this.selectedFile) return '';
    return this.formatBytes(this.selectedFile.size);
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Format recording time for display
   */
  get recordingTimeFormatted(): string {
    const minutes = Math.floor(this.recordingTime / 60);
    const seconds = this.recordingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Toggle between upload and record mode
   */
  setMode(record: boolean): void {
    if (this.recordMode === record) return;
    
    this.stopRecording();
    this.recordMode = record;
    this.selectedFile = null;
    this.fileSizeError = null;
  }

  /**
   * Start audio recording using AudioContext for WAV output
   */
  async startRecording(): Promise<void> {
    try {
      this.fileSizeError = null;
      
      // Set recording state FIRST and start timer
      this.isRecording = true;
      this.recordingTime = 0;
      this.audioData = [];
      this.cdr.detectChanges();
      
      // Start timer immediately
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
      }
      
      // Run setInterval outside Angular, then re-enter for updates
      this.ngZone.runOutsideAngular(() => {
        this.recordingTimer = window.setInterval(() => {
          this.ngZone.run(() => {
            this.recordingTime++;
            console.log('Recording time:', this.recordingTime);
            this.cdr.detectChanges();
            // Auto-stop at max recording time
            if (this.recordingTime >= this.MAX_RECORDING_TIME) {
              this.stopRecording();
            }
          });
        }, 1000);
      });
      
      // Now get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: this.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.scriptProcessor.onaudioprocess = (event) => {
        if (this.isRecording) {
          const inputData = event.inputBuffer.getChannelData(0);
          // Copy the data to avoid reference issues
          this.audioData.push(new Float32Array(inputData));
        }
      };
      
      this.mediaStreamSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);
      
    } catch (error) {
      console.error('Microphone access denied:', error);
      // Stop timer if mic access fails
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }
      this.isRecording = false;
      this.cdr.detectChanges();
      alert('Unable to access microphone. Please check permissions.');
    }
  }

  /**
   * Stop audio recording and create WAV file
   */
  stopRecording(): void {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    
    if (!this.isRecording) return;
    
    // Disconnect audio nodes
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }
    
    // Create WAV file from recorded data
    if (this.audioData.length > 0) {
      const wavBlob = this.createWavFile();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([wavBlob], `recording-${timestamp}.wav`, { type: 'audio/wav' });
      this.selectedFile = file;
      console.log('Created WAV file:', file.name, file.size, 'bytes');
      this.fileSelected.emit(file);
    }
    
    this.cleanupStream();
    this.isRecording = false;
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.cdr.detectChanges();
  }

  /**
   * Create WAV file from recorded audio data
   */
  private createWavFile(): Blob {
    // Merge all audio chunks into one buffer
    const totalLength = this.audioData.reduce((acc, chunk) => acc + chunk.length, 0);
    const audioBuffer = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.audioData) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Convert Float32 to Int16
    const int16Buffer = new Int16Array(audioBuffer.length);
    for (let i = 0; i < audioBuffer.length; i++) {
      const s = Math.max(-1, Math.min(1, audioBuffer[i]));
      int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Create WAV header
    const wavBuffer = new ArrayBuffer(44 + int16Buffer.length * 2);
    const view = new DataView(wavBuffer);
    
    // RIFF header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Buffer.length * 2, true);
    this.writeString(view, 8, 'WAVE');
    
    // fmt chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, 1, true); // num channels
    view.setUint32(24, this.sampleRate, true); // sample rate
    view.setUint32(28, this.sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    
    // data chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, int16Buffer.length * 2, true);
    
    // Write audio data
    const int16View = new Int16Array(wavBuffer, 44);
    int16View.set(int16Buffer);
    
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  /**
   * Helper to write string to DataView
   */
  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  /**
   * Re-record audio
   */
  reRecord(): void {
    this.selectedFile = null;
    this.audioData = [];
    this.startRecording();
  }

  /**
   * Cleanup media stream
   */
  private cleanupStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.stopRecording();
    this.cleanupStream();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
