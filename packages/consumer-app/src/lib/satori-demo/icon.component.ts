/**
 * Demo Satori Icon Component
 * This demonstrates how you would import and use the real @hylandsoftware/satori-icons
 * 
 * In a real implementation, this would be:
 * import { SatIconComponent } from '@hylandsoftware/satori-icons';
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sat-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      [class]="iconClasses"
      [style.fontSize.px]="size"
      [attr.aria-label]="name">
      {{ getIconSymbol(name) }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .sat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-style: normal;
      line-height: 1;
      user-select: none;
    }
    
    .sat-icon--primary { color: var(--primary-color); }
    .sat-icon--secondary { color: var(--secondary-color); }
    .sat-icon--success { color: var(--success-color); }
    .sat-icon--warning { color: var(--warning-color); }
    .sat-icon--error { color: var(--error-color); }
  `]
})
export class SatIconComponent {
  @Input() name: string = 'star';
  @Input() size: number = 24;
  @Input() color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | undefined;

  get iconClasses(): string {
    const classes = ['sat-icon'];
    if (this.color) {
      classes.push(`sat-icon--${this.color}`);
    }
    return classes.join(' ');
  }

  getIconSymbol(iconName: string): string {
    // Simple mapping of icon names to symbols for demo purposes
    const iconMap: { [key: string]: string } = {
      'star': '★',
      'heart': '♥',
      'check': '✓',
      'close': '✕',
      'arrow-right': '→',
      'arrow-left': '←',
      'home': '🏠',
      'user': '👤',
      'settings': '⚙️',
      'search': '🔍',
      'menu': '☰',
      'download': '⬇️',
      'upload': '⬆️',
      'edit': '✏️',
      'delete': '🗑️',
      'add': '+',
      'info': 'ℹ️',
      'warning': '⚠️',
      'error': '❌',
      'success': '✅'
    };
    
    return iconMap[iconName] || '●';
  }
}