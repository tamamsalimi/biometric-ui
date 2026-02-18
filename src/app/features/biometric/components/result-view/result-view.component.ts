import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../../../core/models/employee.model';

/**
 * ResultViewComponent
 * 
 * Presentational component for displaying registration results.
 * Architecture Decision: Dumb component that displays data and emits reset event.
 * 
 * Inputs: employee data, transcript
 * Outputs: reset event
 */
@Component({
  selector: 'app-result-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-view.component.html',
  styleUrls: ['./result-view.component.css']
})
export class ResultViewComponent {
  @Input() employee: Employee | null = null;
  @Input() transcript: string | null = null;
  @Output() resetTriggered = new EventEmitter<void>();

  /**
   * Handle reset action
   */
  onReset(): void {
    this.resetTriggered.emit();
  }
}
