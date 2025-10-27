import { Component, Input, Output, EventEmitter, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
export type InputSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, SatIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="ui-input-container" [class]="getContainerClasses()">
      @if (label) {
        <label class="ui-input-label" [for]="inputId">
          {{ label }}
          @if (required) {
            <span class="ui-input-required">*</span>
          }
        </label>
      }
      
      <div class="ui-input-wrapper">
        @if (prefixIcon) {
          <span class="ui-input-prefix-icon" [innerHTML]="prefixIcon"></span>
        }
        
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value()"
          [class]="getInputClasses()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          (keydown)="onKeyDown($event)"
        />
        
        @if (suffixIcon || clearable) {
          <div class="ui-input-suffix">
            @if (clearable && value() && !disabled) {
              <span 
                class="ui-input-clear-button"
                (click)="clearInput()">
                ✕
              </span>
            }
            @if (suffixIcon) {
              <span class="ui-input-suffix-icon" [innerHTML]="suffixIcon"></span>
            }
          </div>
        }
      </div>
      
      @if (helperText || errorMessage) {
        <div class="ui-input-helper-text" [class.ui-input-error-text]="!!errorMessage">
          {{ errorMessage || helperText }}
        </div>
      }
    </div>
  `,
  styleUrls: ['./ui-input.component.scss']
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() clearable: boolean = false;
  @Input() prefixIcon: string = '';
  @Input() suffixIcon: string = '';
  @Input() helperText: string = '';
  @Input() errorMessage: string = '';
  @Input() inputId: string = `ui-input-${Math.random().toString(36).substr(2, 9)}`;
  
  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<FocusEvent>();
  @Output() inputBlur = new EventEmitter<FocusEvent>();
  @Output() keyDown = new EventEmitter<KeyboardEvent>();
  
  value = signal('');
  isFocused = signal(false);
  
  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};
  
  writeValue(value: string): void {
    this.value.set(value || '');
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    
    this.value.set(newValue);
    this.onChange(newValue);
    this.inputChange.emit(newValue);
  }
  
  onFocus(): void {
    this.isFocused.set(true);
    this.inputFocus.emit();
  }
  
  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
    this.inputBlur.emit();
  }
  
  onKeyDown(event: KeyboardEvent): void {
    this.keyDown.emit(event);
  }

  clearInput(): void {
    this.value.set('');
    this.onChange('');
    this.inputChange.emit('');
  }
  
  clearValue(): void {
    this.value.set('');
    this.onChange('');
    this.inputChange.emit('');
  }
  
  getContainerClasses(): string {
    return [
      'ui-input-container',
      `ui-input-container--${this.size}`,
      this.disabled ? 'ui-input-container--disabled' : '',
      this.errorMessage ? 'ui-input-container--error' : '',
      this.isFocused() ? 'ui-input-container--focused' : ''
    ].filter(Boolean).join(' ');
  }
  
  getInputClasses(): string {
    return [
      'ui-input',
      this.prefixIcon ? 'ui-input--has-prefix' : '',
      this.suffixIcon || this.clearable ? 'ui-input--has-suffix' : ''
    ].filter(Boolean).join(' ');
  }
}