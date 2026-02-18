import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';

/**
 * FaceService
 * 
 * Handles face recognition related API operations.
 * Architecture Decision: Uses FormData for file uploads via ApiBaseService.
 * 
 * Endpoints:
 * - POST /face/register/:employeeId - Register face for employee
 * - POST /face/verify/:employeeId - Verify face (future)
 */
@Injectable({ providedIn: 'root' })
export class FaceService {
  private readonly endpoint = '/face';

  constructor(private api: ApiBaseService) {}

  /**
   * Upload and register face image for an employee
   * @param employeeId - Employee ID to associate face with
   * @param file - Face image file
   * @returns Observable<unknown> - Registration result
   */
  uploadFace(employeeId: number, file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData(`${this.endpoint}/register/${employeeId}`, formData);
  }

  /**
   * Verify face against registered employee
   * @param employeeId - Employee ID to verify against
   * @param file - Face image file to verify
   * @returns Observable<unknown> - Verification result
   */
  verifyFace(employeeId: number, file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData(`${this.endpoint}/verify/${employeeId}`, formData);
  }
}
