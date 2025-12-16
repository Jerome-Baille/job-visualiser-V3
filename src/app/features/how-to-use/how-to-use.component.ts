import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-how-to-use',
  standalone: true,
  imports: [MatCardModule, MatDividerModule],
  templateUrl: './how-to-use.component.html',
  styleUrl: './how-to-use.component.scss'
})
export class HowToUseComponent {

}
