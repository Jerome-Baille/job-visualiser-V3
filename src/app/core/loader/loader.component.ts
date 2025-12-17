import { Component, Signal, inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  private loaderService = inject(LoaderService);

  readonly visible: Signal<boolean> = this.loaderService.visible;
}
