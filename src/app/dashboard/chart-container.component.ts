import { Component, Input, OnChanges } from '@angular/core';
import { JobData } from '../interfaces';

@Component({
  selector: 'app-chart-container',
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartContainerComponent implements OnChanges {
  @Input() jobs: JobData[] = [];

  // Add chart data processing logic here as needed
  ngOnChanges() {
    // Placeholder for chart data processing
  }
}
