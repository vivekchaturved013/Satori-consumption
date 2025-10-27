import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, SatIconModule],
  template: `
    <button 
      [class]="buttonClasses()"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      [type]="type">
      
      @if (loading) {
        <div class="ui-button-spinner"></div>
      }
      
      @if (iconLeft && !loading) {
        <span class="ui-button-icon-left" [innerHTML]="iconLeft"></span>
      }
      
      <span class="ui-button-content">
        <ng-content></ng-content>
      </span>
      
      @if (iconRight && !loading) {
        <span class="ui-button-icon-right" [innerHTML]="iconRight"></span>
      }
    </button>
  `,
  styleUrls: ['./ui-button.component.scss']
})
export class UiButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() iconLeft: string = '';
  @Input() iconRight: string = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  
  @Output() buttonClick = new EventEmitter<Event>();
  
  buttonClasses = computed(() => {
    return [
      'ui-button',
      `ui-button--${this.variant}`,
      `ui-button--${this.size}`,
      this.fullWidth ? 'ui-button--full-width' : '',
      this.loading ? 'ui-button--loading' : '',
      this.disabled ? 'ui-button--disabled' : ''
    ].filter(Boolean).join(' ');
  });
  
  onClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}