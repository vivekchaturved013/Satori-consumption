import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

// Import Satori UI components
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';
import { SatPlatformNavModule } from '@hylandsoftware/satori-ui/platform-nav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    SatAppHeaderModule,
    SatLogoModule,
    SatPlatformNavModule
  ],
  templateUrl: './app-with-satori-header.component.html',
  styleUrls: ['./app-with-satori-header.component.scss']
})
export class AppWithSatoriHeaderComponent {
  title = 'Nuxeo ECM System';
  
  constructor() {
    console.log('Nuxeo Satori App with full header initialized');
  }
}