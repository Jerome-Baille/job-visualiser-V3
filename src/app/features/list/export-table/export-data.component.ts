import { Component, inject, signal } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { SnackbarService } from '../../../core/services/snackbar.service';

type ExportFilterMode = 'year' | 'single' | 'range';
type ExportFormat = 'excel' | 'pdf' | '';

@Component({
  selector: 'app-export-data',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
    ,MatInputModule
    ,MatDatepickerModule
    ,ReactiveFormsModule
],
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.scss'],
  providers: [provideNativeDateAdapter()]
})
export class ExportDataComponent {
  private jobService = inject(JobService);
  private snackbar = inject(SnackbarService);

  readonly years = signal<string[]>([]);

  readonly form = new FormGroup({
    mode: new FormControl<ExportFilterMode>('year', { nonNullable: true }),
    year: new FormControl<string>('', { nonNullable: true }),
    singleDate: new FormControl<Date | null>(null),
    range: new FormGroup({
      start: new FormControl<Date | null>(null),
      end: new FormControl<Date | null>(null),
    }),
    format: new FormControl<ExportFormat>('', { nonNullable: true }),
  });
  
  formatOptions = [
    { value: 'excel', icon: 'table_chart', label: 'Excel' },
    { value: 'pdf', icon: 'picture_as_pdf', label: 'PDF' }
  ];
  
  get selectedFormatOption() {
    return this.formatOptions.find(option => option.value === this.form.controls.format.value);
  }

  get canExport(): boolean {
    const mode = this.form.controls.mode.value;
    const format = this.form.controls.format.value;
    if (!format) return false;

    if (mode === 'year') {
      return !!this.form.controls.year.value;
    }
    if (mode === 'single') {
      return !!this.form.controls.singleDate.value;
    }
    // range
    const start = this.form.controls.range.controls.start.value;
    const end = this.form.controls.range.controls.end.value;
    return !!start && !!end && end.getTime() >= start.getTime();
  }

  constructor() {
    // Add "All Years" option first
    const years: string[] = ['All Years'];
    
    const currentYear = new Date().getFullYear();
    for (let year = 2022; year <= currentYear; year++) {
      years.push(year.toString());
    }

    this.years.set(years);
  }

  private formatDateYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async handleExportClick() {
    try {
      const mode = this.form.controls.mode.value;
      const format = this.form.controls.format.value;

      let selectedYear = '0000';
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (mode === 'year') {
        selectedYear = this.form.controls.year.value || '0000';
      } else if (mode === 'single') {
        const date = this.form.controls.singleDate.value;
        if (date) startDate = this.formatDateYYYYMMDD(date);
      } else {
        const start = this.form.controls.range.controls.start.value;
        const end = this.form.controls.range.controls.end.value;
        if (start) startDate = this.formatDateYYYYMMDD(start);
        if (end) endDate = this.formatDateYYYYMMDD(end);
      }

      await this.jobService.exportOpportunities(selectedYear, format, startDate, endDate);
      this.snackbar.success('Your data has been exported successfully!');
    } catch {
      this.snackbar.error('An error occurred while exporting your data. Please try again later.');
    }
  }
}
