import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Core imports
import { 
  EmployeeService, 
  FaceService, 
  SpeechService, 
  LoadingService 
} from '../../../../core/services';
import { 
  Employee, 
  CreateEmployeeRequest 
} from '../../../../core/models/employee.model';
import { SpeechResult } from '../../../../core/models/speech.model';

// Feature components
import { EmployeeFormComponent } from '../../components/employee-form/employee-form.component';
import { FaceUploadComponent } from '../../components/face-upload/face-upload.component';
import { SpeechUploadComponent } from '../../components/speech-upload/speech-upload.component';
import { ResultViewComponent } from '../../components/result-view/result-view.component';
import { StatusBarComponent } from '../../components/status-bar/status-bar.component';

// Shared components
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ChangeDetectorRef } from '@angular/core';

/**
 * BiometricPageComponent
 * 
 * Smart container component that orchestrates the biometric registration flow.
 * Architecture Decision: Container/Presenter pattern
 * - Manages application state
 * - Coordinates service calls
 * - Passes data down to presentational components
 * - Handles events from child components
 * 
 * Flow:
 * 1. Employee Registration (EmployeeFormComponent)
 * 2. Face Upload (FaceUploadComponent)
 * 3. Speech Upload (SpeechUploadComponent)
 * 4. Result Display (ResultViewComponent)
 */

/** Registration flow steps */
enum RegistrationStep {
  EMPLOYEE = 1,
  FACE = 2,
  SPEECH = 3,
  COMPLETE = 4
}

@Component({
  selector: 'app-biometric-page',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeFormComponent,
    FaceUploadComponent,
    SpeechUploadComponent,
    ResultViewComponent,
    StatusBarComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './biometric-page.component.html',
  styleUrls: ['./biometric-page.component.css']
})
export class BiometricPageComponent implements OnInit, OnDestroy {
  // Expose enum to template
  readonly RegistrationStep = RegistrationStep;

  // State
  currentStep: RegistrationStep = RegistrationStep.EMPLOYEE;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Modal state for existing employee
  showExistingEmployeeModal = false;
  existingEmployee: Employee | null = null;
  pendingEmployeeData: CreateEmployeeRequest | null = null;

  // Data
  employee: Employee | null = null;
  faceFile: File | null = null;
  speechFile: File | null = null;
  transcript: string | null = null;

  @ViewChild(FaceUploadComponent) faceComponent?: FaceUploadComponent;
  @ViewChild(SpeechUploadComponent) speechComponent?: SpeechUploadComponent;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private faceService: FaceService,
    private speechService: SpeechService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle employee form submission
   * First checks if employee exists by code, then creates or uses existing
   */
  onEmployeeSubmit(employeeData: CreateEmployeeRequest): void {
    this.clearMessages();
    this.loading = true;
    this.cdr.detectChanges();
    console.log('Submitting employee data:', employeeData);
    // First check if employee already exists by code
    this.employeeService.getEmployeeByCode(employeeData.code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (existingEmployee) => {
          if (existingEmployee && existingEmployee.id) {
            // Employee exists - show confirmation modal
            this.existingEmployee = existingEmployee;
            this.pendingEmployeeData = employeeData;
            this.showExistingEmployeeModal = true;
            this.loading = false;
            this.cdr.detectChanges();
          } else {
            // Employee doesn't exist - create new one
            this.createNewEmployee(employeeData);
          }
        },
        error: (err) => {
          // 404 means employee doesn't exist - create new one
          if (err.status === 404) {
            this.createNewEmployee(employeeData);
          } else {
            this.errorMessage = err.message || 'Failed to check employee. Please try again.';
            this.loading = false;
            this.cdr.detectChanges();
          }
        }
      });
  }

  /**
   * Confirm using existing employee
   */
  confirmUseExistingEmployee(): void {
    if (this.existingEmployee) {
      // Use the authoritative data returned from the backend
      this.employee = this.existingEmployee;
      this.successMessage = `Using existing employee "${this.existingEmployee.name || this.existingEmployee.code}". Proceeding to face registration.`;
      this.currentStep = RegistrationStep.FACE;
    }
    this.closeExistingEmployeeModal();
  }

  /**
   * Cancel and close modal
   */
  closeExistingEmployeeModal(): void {
    this.showExistingEmployeeModal = false;
    this.existingEmployee = null;
    this.pendingEmployeeData = null;
    this.cdr.detectChanges();
  }

  /**
   * Create new employee
   */
  private createNewEmployee(employeeData: CreateEmployeeRequest): void {
    this.employeeService.createEmployee(employeeData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employee) => {
          this.employee = employee;
          this.successMessage = 'Employee registered successfully.';
          this.currentStep = RegistrationStep.FACE;
          
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to create employee. Please try again.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Handle face file selection
   */
  onFaceFileSelected(file: File): void {
    this.faceFile = file;
    this.clearMessages();
  }

  /**
   * Handle face upload
   */
  onFaceUpload(): void {
    if (!this.faceFile || !this.employee?.id) return;

    this.clearMessages();
    this.loading = true;
    this.cdr.detectChanges();

    this.faceService.uploadFace(this.employee.id, this.faceFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Face image uploaded successfully.';
          this.currentStep = RegistrationStep.SPEECH;
          // Ensure camera is stopped after successful upload
          try { this.faceComponent?.stopCamera(); } catch { }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to upload face image. Please try again.';
          this.loading = false;
        }
      });
  }

  /**
   * Handle speech file selection
   */
  onSpeechFileSelected(file: File): void {
    this.speechFile = file;
    this.clearMessages();
  }

  /**
   * Handle speech upload
   */
  onSpeechUpload(): void {
    if (!this.speechFile || !this.employee?.id) return;

    this.clearMessages();
    this.loading = true;
    this.cdr.detectChanges();

    this.speechService.uploadSpeech(this.employee.id, this.speechFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: SpeechResult) => {
          console.log('Speech upload success:', result);
          this.transcript = result?.transcription || 'Voice registered';
          this.successMessage = 'Speech uploaded and processed successfully.';
          this.currentStep = RegistrationStep.COMPLETE;
          // Ensure microphone/capture is stopped after successful upload
          try { this.speechComponent?.stopRecording(); } catch { }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Speech upload error:', err);
          this.errorMessage = err?.error?.message || err.message || 'Failed to process speech. Please try again.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Clear status messages
   */
  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  /**
   * Reset the registration flow
   */
  onReset(): void {
    this.currentStep = RegistrationStep.EMPLOYEE;
    this.employee = null;
    this.faceFile = null;
    this.speechFile = null;
    this.transcript = null;
    this.clearMessages();
    // Ensure any open camera/microphone streams are stopped
    try { this.faceComponent?.stopCamera(); } catch { }
    try { this.speechComponent?.stopRecording(); } catch { }
  }
}
