import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';

export type CardVariant = 'default' | 'outlined' | 'elevated';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule, SatIconModule],
  template: `
    <div [class]="getCardClasses()">
      @if (title || subtitle || icon) {
        <div class="ui-card-header">
          @if (icon) {
            <span class="ui-card-icon" [innerHTML]="icon"></span>
          }
          <div class="ui-card-header-content">
            @if (title) {
              <h3 class="ui-card-title">{{ title }}</h3>
            }
            @if (subtitle) {
              <p class="ui-card-subtitle">{{ subtitle }}</p>
            }
          </div>
          @if (headerActions) {
            <div class="ui-card-header-actions">
              <ng-content select="[slot=header-actions]"></ng-content>
            </div>
          }
        </div>
      }
      
      <div class="ui-card-content">
        <ng-content></ng-content>
      </div>
      
      @if (hasFooter) {
        <div class="ui-card-footer">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styleUrls: ['./ui-card.component.scss']
})
export class UiCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() variant: CardVariant = 'default';
  @Input() hoverable: boolean = false;
  @Input() clickable: boolean = false;
  @Input() headerActions: boolean = false;
  @Input() hasFooter: boolean = false;
  
  getCardClasses(): string {
    return [
      'ui-card',
      `ui-card--${this.variant}`,
      this.hoverable ? 'ui-card--hoverable' : '',
      this.clickable ? 'ui-card--clickable' : ''
    ].filter(Boolean).join(' ');
  }
}