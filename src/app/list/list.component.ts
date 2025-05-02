
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ListTableComponent } from './list-table/list-table.component';
import { ExportDataComponent } from './export-table/export-data.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    ExportDataComponent,
    ListTableComponent
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  handleRefresh() {
    localStorage.removeItem('jobs');
    window.location.reload();
  }
}
