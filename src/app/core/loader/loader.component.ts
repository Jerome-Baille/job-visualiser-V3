import { Component } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [NgIf, MatProgressSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  visible$;

  constructor(private loaderService: LoaderService) {
    this.visible$ = this.loaderService.visible;
  }
}
