import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SatAutocompleteComponent, SatAutocompleteOption } from './sat-autocomplete.component';
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';

@Component({
  selector: 'app-autocomplete-demo',
  standalone: true,
  imports: [
    CommonModule,
    SatAutocompleteComponent,
    SatAppHeaderModule,
    SatLogoModule
  ],
  template: `
    <!-- Satori Header -->
    <sat-app-header>
      <sat-logo satAppHeaderLogo>
        <sat-h-mark-logo></sat-h-mark-logo>
        <sat-word-mark-logo></sat-word-mark-logo>
      </sat-logo>
      <h1 satAppHeaderTitle>Satori Autocomplete Demo</h1>
    </sat-app-header>

    <div class="demo-container">
      <h2>Custom Satori-Styled Autocomplete</h2>
      
      <!-- Your requested usage pattern -->
      <div class="demo-section">
        <h3>Basic Usage (Your Example)</h3>
        <sat-autocomplete
          [dropdownOptions]="basicOptions"
          placeholder="Search names..."
          (optionSelected)="onBasicOptionSelected($event)"
          (inputChanged)="onInputChanged($event)">
        </sat-autocomplete>
      </div>

      <!-- Extended examples -->
      <div class="demo-section">
        <h3>Extended Usage</h3>
        <sat-autocomplete
          [dropdownOptions]="extendedOptions"
          placeholder="Search users and departments..."
          (optionSelected)="onExtendedOptionSelected($event)">
        </sat-autocomplete>
      </div>

      <!-- Results display -->
      <div class="results-section" *ngIf="selectedOption">
        <h3>Selected Option:</h3>
        <pre>{{ selectedOption | json }}</pre>
      </div>

      <div class="results-section" *ngIf="currentInput">
        <h3>Current Input:</h3>
        <p>{{ currentInput }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./autocomplete-demo.component.scss']
})
export class AutocompleteDemoComponent {
  
  // Your exact example from the request
  basicOptions: SatAutocompleteOption[] = [
    { name: 'Mary' },
    { name: 'Mary-Anne' },
    { name: 'Igor' }
  ];

  // Extended example with more features
  extendedOptions: SatAutocompleteOption[] = [
    { name: 'John Smith', value: { id: 1, role: 'Developer' } },
    { name: 'Sarah Johnson', value: { id: 2, role: 'Designer' } },
    { name: 'Mike Davis', value: { id: 3, role: 'Manager' } },
    { name: 'Emily Brown', value: { id: 4, role: 'Analyst' } },
    { name: 'Chris Wilson', value: { id: 5, role: 'Developer' }, disabled: true },
    { name: 'Engineering Department', value: { type: 'department', id: 'eng' } },
    { name: 'Design Department', value: { type: 'department', id: 'design' } },
    { name: 'Product Department', value: { type: 'department', id: 'product' } }
  ];

  selectedOption: SatAutocompleteOption | null = null;
  currentInput: string = '';

  onBasicOptionSelected(option: SatAutocompleteOption) {
    console.log('Basic option selected:', option);
    this.selectedOption = option;
  }

  onExtendedOptionSelected(option: SatAutocompleteOption) {
    console.log('Extended option selected:', option);
    this.selectedOption = option;
  }

  onInputChanged(input: string) {
    console.log('Input changed:', input);
    this.currentInput = input;
  }
}