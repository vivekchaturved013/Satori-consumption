/**
 * Demo Satori Button Component
 * This demonstrates how you would import and use the real @hylandsoftware/satori-ui button
 * 
 * In a real implementation, this would be:
 * import { SatButtonComponent } from '@hylandsoftware/satori-ui/button';
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SatButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type SatButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'sat-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="buttonClasses"
      [disabled]="disabled"
      (click)="clicked.emit($event)"
      type="button">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    .sat-button {
      font-family: var(--font-family-primary);
      font-weight: var(--font-weight-medium);
      border: none;
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      text-decoration: none;
      box-sizing: border-box;
    }
    
    .sat-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* Variants */
    .sat-button--primary {
      background-color: var(--primary-color);
      color: white;
    }
    
    .sat-button--primary:hover:not(:disabled) {
      filter: brightness(110%);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .sat-button--secondary {
      background-color: var(--secondary-color);
      color: white;
    }
    
    .sat-button--secondary:hover:not(:disabled) {
      filter: brightness(110%);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .sat-button--outline {
      background-color: transparent;
      color: var(--primary-color);
      border: 2px solid var(--primary-color);
    }
    
    .sat-button--outline:hover:not(:disabled) {
      background-color: var(--primary-color);
      color: white;
    }
    
    .sat-button--ghost {
      background-color: transparent;
      color: var(--primary-color);
    }
    
    .sat-button--ghost:hover:not(:disabled) {
      background-color: rgba(25, 118, 210, 0.1);
    }
    
    /* Sizes */
    .sat-button--small {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: 0.875rem;
      min-height: 32px;
    }
    
    .sat-button--medium {
      padding: var(--spacing-sm) var(--spacing-lg);
      font-size: var(--font-size-base);
      min-height: 40px;
    }
    
    .sat-button--large {
      padding: var(--spacing-md) var(--spacing-xl);
      font-size: 1.125rem;
      min-height: 48px;
    }
  `]
})
export class SatButtonComponent {
  @Input() variant: SatButtonVariant = 'primary';
  @Input() size: SatButtonSize = 'medium';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<Event>();

  get buttonClasses(): string {
    return [
      'sat-button',
      `sat-button--${this.variant}`,
      `sat-button--${this.size}`
    ].join(' ');
  }
}