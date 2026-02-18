import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CreateEmployeeRequest } from '../../../../core/models/employee.model';

/**
 * EmployeeFormComponent
 * 
 * Presentational component for employee registration form.
 * Architecture Decision: Dumb component that emits events to parent.
 * No business logic - only form handling and validation.
 * 
 * Inputs: loading state, initial values
 * Outputs: form submission event with employee data
 */
@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  @Input() loading = false;
  @Output() submitEmployee = new EventEmitter<CreateEmployeeRequest>();

  employeeForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.submitEmployee.emit(this.employeeForm.value);
    }
  }

  /**
   * Check if a form field has error
   */
  hasError(field: string, error: string): boolean {
    const control = this.employeeForm.get(field);
    return control ? control.hasError(error) && control.touched : false;
  }

  /**
   * Check if form is valid
   */
  get isFormValid(): boolean {
    return this.employeeForm.valid;
  }
}
