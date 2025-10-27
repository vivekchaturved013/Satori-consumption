import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


export interface SatAutocompleteOption {
  name: string;
  value?: any;
  disabled?: boolean;
}

@Component({
  selector: 'sat-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sat-autocomplete">
      <div class="sat-autocomplete-input-container">
        <input
          type="text"
          class="sat-autocomplete-input"
          [placeholder]="placeholder"
          [(ngModel)]="inputValue"
          (input)="onInputChange($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
        />
        <span class="sat-autocomplete-icon">{{ isOpen() ? '🔼' : '🔽' }}</span>
      </div>
      
      @if (isOpen() && filteredOptions().length > 0) {
        <div class="sat-autocomplete-dropdown">
          @for (option of filteredOptions(); track option.name) {
            <div 
              class="sat-autocomplete-option"
              [class.sat-autocomplete-option-selected]="selectedIndex() === $index"
              [class.sat-autocomplete-option-disabled]="option.disabled"
              (mousedown)="selectOption(option)"
              (mouseenter)="setSelectedIndex($index)">
              {{ option.name }}
            </div>
          }
          @if (filteredOptions().length === 0) {
            <div class="sat-autocomplete-no-options">No options found</div>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./sat-autocomplete.component.scss']
})
export class SatAutocompleteComponent {
  @Input() dropdownOptions: SatAutocompleteOption[] = [];
  @Input() placeholder: string = 'Type to search...';
  @Input() disabled: boolean = false;
  
  @Output() optionSelected = new EventEmitter<SatAutocompleteOption>();
  @Output() inputChanged = new EventEmitter<string>();
  
  // Signals for reactive state management
  inputValue = signal('');
  isOpen = signal(false);
  selectedIndex = signal(-1);
  
  // Computed filtered options based on input
  filteredOptions = computed(() => {
    const searchTerm = this.inputValue().toLowerCase();
    if (!searchTerm) {
      return this.dropdownOptions;
    }
    return this.dropdownOptions.filter(option => 
      option.name.toLowerCase().includes(searchTerm) && !option.disabled
    );
  });
  
  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.inputValue.set(target.value);
    this.inputChanged.emit(target.value);
    this.isOpen.set(true);
    this.selectedIndex.set(-1);
  }
  
  onFocus() {
    this.isOpen.set(true);
  }
  
  onBlur() {
    // Delay closing to allow for option selection
    setTimeout(() => {
      this.isOpen.set(false);
      this.selectedIndex.set(-1);
    }, 150);
  }
  
  onKeyDown(event: KeyboardEvent) {
    const options = this.filteredOptions();
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update(index => 
          index < options.length - 1 ? index + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update(index => 
          index > 0 ? index - 1 : options.length - 1
        );
        break;
        
      case 'Enter':
        event.preventDefault();
        const selectedOption = options[this.selectedIndex()];
        if (selectedOption) {
          this.selectOption(selectedOption);
        }
        break;
        
      case 'Escape':
        this.isOpen.set(false);
        this.selectedIndex.set(-1);
        break;
    }
  }
  
  selectOption(option: SatAutocompleteOption) {
    if (option.disabled) return;
    
    this.inputValue.set(option.name);
    this.isOpen.set(false);
    this.selectedIndex.set(-1);
    this.optionSelected.emit(option);
  }
  
  setSelectedIndex(index: number) {
    this.selectedIndex.set(index);
  }
}