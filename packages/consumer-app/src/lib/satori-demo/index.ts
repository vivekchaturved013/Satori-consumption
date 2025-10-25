/**
 * Demo Satori Module
 * This demonstrates how you would import the real Satori UI module
 * 
 * In a real implementation, this would be:
 * import { SatButtonModule, SatCardModule, SatIconModule } from '@hylandsoftware/satori-ui';
 */

import { NgModule } from '@angular/core';
import { SatButtonComponent } from './button.component';
import { SatCardComponent } from './card.component';
import { SatIconComponent } from './icon.component';

// Export components individually for standalone usage
export { SatButtonComponent } from './button.component';
export { SatCardComponent } from './card.component';
export { SatIconComponent } from './icon.component';

// Export types
export type { SatButtonVariant, SatButtonSize } from './button.component';

// Traditional module for non-standalone usage
@NgModule({
  imports: [
    SatButtonComponent,
    SatCardComponent,
    SatIconComponent
  ],
  exports: [
    SatButtonComponent,
    SatCardComponent,
    SatIconComponent
  ]
})
export class SatUiModule { }

// Individual modules for selective imports (matches real Satori structure)
@NgModule({
  imports: [SatButtonComponent],
  exports: [SatButtonComponent]
})
export class SatButtonModule { }

@NgModule({
  imports: [SatCardComponent],
  exports: [SatCardComponent]
})
export class SatCardModule { }

@NgModule({
  imports: [SatIconComponent],
  exports: [SatIconComponent]
})
export class SatIconModule { }