import { Routes } from '@angular/router';
import { BiometricPageComponent } from './features/biometric/pages/biometric-page/biometric-page.component';

/**
 * Application Routes
 * 
 * Architecture Decision: Lazy loading ready structure.
 * Currently using direct component import for simplicity.
 * Can be converted to lazy loading for larger applications.
 */
export const routes: Routes = [
  { 
    path: '', 
    component: BiometricPageComponent,
    title: 'Biometric Registration'
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
