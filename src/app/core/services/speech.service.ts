import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBaseService } from './api-base.service';
import { SpeechResult } from '../models/speech.model';

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private readonly endpoint = '/speech';

  constructor(private api: ApiBaseService) {}

  uploadSpeech(employeeId: number, audioFile: File): Observable<SpeechResult> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    return this.api
      .postFormData<any>(`${this.endpoint}/recognize/${employeeId}`, formData)
      .pipe(
        map((response: any) => {
          console.log('SpeechService: Raw response:', response);

          // ✅ Expected backend format
          return {
            status: response?.status,
            employeeId: response?.employeeId,
            transcription: response?.transcription || 'No speech detected',
            message: response?.message || 'Speech processed successfully'
          } as SpeechResult;
        })
      );
  }
}
