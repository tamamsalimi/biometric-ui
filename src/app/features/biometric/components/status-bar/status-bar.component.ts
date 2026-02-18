import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Weather, Datetime } from '../../../../core/models/weather.model';
import { UtilityService } from '../../../../core/services/utility.service';
import { ChangeDetectorRef } from '@angular/core';


/**
 * StatusBarComponent
 * Fetches and displays time + weather directly from API
 */
@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-bar">
      <!-- TOP: TIME CENTERED -->
      <div class="status-time-row">
        <span class="time" *ngIf="datetime; else loadingTime">{{ datetime.time }}</span>
        <ng-template #loadingTime>
          <span class="time loading">--:--</span>
        </ng-template>
      </div>
      
      <!-- BOTTOM: DATE + WEATHER -->
      <div class="status-info-row">
        <!-- Date -->
        <ng-container *ngIf="datetime; else loadingDate">
          <span class="date">{{ datetime.day }}, {{ datetime.date }}</span>
        </ng-container>
        <ng-template #loadingDate>
          <span class="date loading">Loading date...</span>
        </ng-template>
        
        <span class="separator">•</span>
        
        <!-- Weather -->
        <span class="weather" *ngIf="weather; else loadingWeather">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="5" fill="#00A758"/>
            <path d="M9 2v-1M9 17v-1M2 9H1M17 9h-1M4.22 4.22l-.71-.71M14.49 14.49l-.71-.71M4.22 13.78l-.71.71M14.49 3.51l-.71.71"
              stroke="#00A758" stroke-width="1"/>
          </svg>
          {{ weather.temperature }}°C {{ weather.weather }}
        </span>
        <ng-template #loadingWeather>
          <span class="weather loading">Loading weather...</span>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .status-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0, 167, 88, 0.15);
      font-family: 'SF Pro Display','Inter',Arial,sans-serif;
    }

    .status-time-row {
      margin-bottom: 6px;
    }

    .time {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      letter-spacing: 0.02em;
    }

    .time.loading {
      color: #ccc;
    }

    .status-info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #666;
    }

    .date {
      font-weight: 500;
      color: #888;
    }

    .date.loading {
      color: #ccc;
      font-style: italic;
    }

    .separator {
      color: #ccc;
    }

    .weather {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      color: #666;
    }

    .weather.loading {
      color: #ccc;
      font-style: italic;
    }

    .weather svg {
      flex-shrink: 0;
    }
  `]
})
export class StatusBarComponent implements OnInit, OnDestroy {
  datetime: Datetime | null = null;
  weather: Weather | null = null;
  
  private destroy$ = new Subject<void>();

constructor(
  private utilityService: UtilityService,
  private cdr: ChangeDetectorRef
) {}


  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    // Fetch datetime
    this.utilityService.getDatetime()
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data) => {
      console.log('StatusBar: Datetime received:', data);
      this.datetime = data;
      this.cdr.detectChanges();   // ⭐ penting
    },
    error: (err) => {
      console.error('StatusBar: Datetime error:', err);
      this.datetime = null;
      this.cdr.detectChanges();
    }
  });


    // Fetch weather
    this.utilityService.getWeather()
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data) => {
      console.log('StatusBar: Weather received:', data);
      this.weather = data;
      this.cdr.detectChanges();   // ⭐ penting
    },
    error: (err) => {
      console.error('StatusBar: Weather error:', err);
      this.weather = null;
      this.cdr.detectChanges();
    }
  });
  }
}
