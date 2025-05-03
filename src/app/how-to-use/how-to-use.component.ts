import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-how-to-use',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule],
  templateUrl: './how-to-use.component.html',
  styleUrl: './how-to-use.component.scss'
})
export class HowToUseComponent {

}
