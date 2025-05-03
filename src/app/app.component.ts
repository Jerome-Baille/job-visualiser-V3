import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from "./loader/loader.component";
import { LoaderService } from "./services/loader.service";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'job-visualiser-V3';

  constructor(private loaderService: LoaderService) {}

  loaderVisible() {
    return this.loaderService.visible();
  }
}
