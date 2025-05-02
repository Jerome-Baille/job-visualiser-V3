import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { JobService } from './services/job.service';
import { JobData } from './interfaces';
import { TableFilterComponent } from './list/table-filter.component';

@Component({
  selector: 'app-list-table',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, TableFilterComponent],
  templateUrl: './list/list-table.component.html'
})
export class ListTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'company', 'type', 'applicationDate', 'decision'];
  dataSource = new MatTableDataSource<JobData>([]);
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData() {
    this.jobService.getOpportunities().then(data => {
      this.dataSource.data = data;
      this.loading = false;
    });
  }

  applyFilter(filteredJobs: JobData[]) {
    this.dataSource.data = filteredJobs;
  }

  navigateToDetail(job: JobData) {
    if (job.id) {
      this.router.navigate(['/job', job.id]);
    }
  }
}