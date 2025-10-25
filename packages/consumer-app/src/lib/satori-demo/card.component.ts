/**
 * Demo Satori Card Component
 * This demonstrates how you would import and use the real @hylandsoftware/satori-ui card
 * 
 * In a real implementation, this would be:
 * import { SatCardComponent } from '@hylandsoftware/satori-ui/card';
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .sat-card {
      background-color: white;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease-in-out;
    }
    
    .sat-card--elevated {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .sat-card--elevated:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .sat-card--outlined {
      border: 2px solid rgba(0, 0, 0, 0.1);
    }
    
    .sat-card--filled {
      background-color: rgba(0, 0, 0, 0.02);
    }
  `]
})
export class SatCardComponent {
  @Input() variant: 'elevated' | 'outlined' | 'filled' = 'elevated';

  get cardClasses(): string {
    return [
      'sat-card',
      `sat-card--${this.variant}`
    ].join(' ');
  }
}