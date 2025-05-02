import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-export-data',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.scss']
})
export class ExportDataComponent {
  selectedFormat = '';
  selectedYear = '';
  years: string[] = [];

  constructor(private jobService: JobService, private toast: ToastService) {
    const currentYear = new Date().getFullYear();
    for (let year = 2022; year <= currentYear; year++) {
      this.years.push(year.toString());
    }
  }

  async handleExportClick() {
    try {
      await this.jobService.exportOpportunities(this.selectedYear, this.selectedFormat);
      this.toast.success('Your data has been exported successfully!');
    } catch (error) {
      this.toast.error('An error occurred while exporting your data. Please try again later.');
    }
  }
}
