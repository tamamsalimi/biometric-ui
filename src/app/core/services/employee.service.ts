import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBaseService } from './api-base.service';
import { Employee, CreateEmployeeRequest } from '../models/employee.model';

/**
 * EmployeeService
 * 
 * Handles all employee-related API operations.
 * Architecture Decision: Extends ApiBaseService for consistent HTTP handling.
 * 
 * Endpoints:
 * - POST /employees - Create new employee
 * - GET /employees/:id - Get employee by ID (future)
 * - PUT /employees/:id - Update employee (future)
 * - DELETE /employees/:id - Delete employee (future)
 */
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly endpoint = '/employees';

  constructor(private api: ApiBaseService) {}

  /**
   * Normalize various backend response shapes into `Employee`
   */
  private normalizeEmployee(raw: any, fallback?: Partial<CreateEmployeeRequest>): Employee | null {
    if (!raw) return null;
    const data = raw.data ?? raw.employee ?? raw;
    const id = data?.id ?? null;
    const code = data?.code ?? data?.employeeCode ?? fallback?.code ?? '';
    const name = data?.name ?? data?.fullName ?? fallback?.name ?? '';
    const email = data?.email ?? fallback?.email ?? '';
    if (!code) return null;
    return { id: id ?? undefined, code, name, email } as Employee;
  }

  /**
   * Create a new employee
   * @param employee - Employee data without ID
   * @returns Observable<Employee> - Created employee with ID
   */
  createEmployee(employee: CreateEmployeeRequest): Observable<Employee> {
    return this.api.post<any>(this.endpoint, employee).pipe(
      map((response: any) => {
        const normalized = this.normalizeEmployee(response, employee as Partial<CreateEmployeeRequest>);
        // If normalization failed, fallback to merging id if present
        if (normalized) return normalized;
        if (response?.id) return { ...employee, id: response.id } as Employee;
        return { ...employee } as Employee;
      })
    );
  }

  /**
   * Get employee by ID
   * @param id - Employee ID
   * @returns Observable<Employee>
   */
  getEmployeeById(id: number): Observable<Employee> {
    return this.api.get<Employee>(`${this.endpoint}/${id}`);
  }

  /**
   * Get employee by code to check existence
   * @param code - Employee code
   * @returns Observable<Employee | null>
   */
  getEmployeeByCode(code: string): Observable<Employee | null> {
    // Request employee by code via backend route: /employees/{code}
    return this.api.get<any>(`${this.endpoint}/${code}`).pipe(
      map((response: any) => {
        console.log('getEmployeeByCode response:', response);
        return this.normalizeEmployee(response) as Employee | null;
      })
    );
  }

  /**
   * Update employee
   * @param id - Employee ID
   * @param employee - Updated employee data
   * @returns Observable<Employee>
   */
  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    return this.api.put<Employee>(`${this.endpoint}/${id}`, employee);
  }

  /**
   * Delete employee
   * @param id - Employee ID
   * @returns Observable<void>
   */
  deleteEmployee(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
