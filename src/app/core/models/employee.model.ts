/**
 * Employee Model
 * Represents an employee entity in the biometric verification system
 */
export interface Employee {
  id?: number;
  code: string;
  name: string;
  email: string;
}

/**
 * Employee creation request payload
 * Used when creating a new employee via API
 */
export type CreateEmployeeRequest = Omit<Employee, 'id'>;

// /**
//  * Employee API response
//  * Standard response wrapper for employee operations
//  */
// export interface EmployeeResponse {
//   data: Employee;
//   message?: string;
//   success: boolean;
// }
