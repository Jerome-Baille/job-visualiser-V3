import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { JobService } from './services/job.service';
import { JobData, PaginationInfo } from './interfaces';
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
  totalItems = 0;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];
  currentPage = 0;
  allJobs: JobData[] = []; // For filtering functionality
  paginationInfo: PaginationInfo | null = null;
  Math = Math; // For use in the template

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
    this.dataSource.sort = this.sort;
    // We'll handle pagination manually
  }

  async loadData(page: number = 0, pageSize: number = 10) {
    this.loading = true;
    try {
      const response = await this.jobService.getOpportunities(pageSize, page * pageSize);
      this.paginationInfo = response.pagination;
      this.totalItems = response.pagination.total;
      
      // Process the job data
      const jobs = response.data.map(job => ({ 
        ...job, 
        id: job.id ? Number(job.id) : undefined 
      }));
      
      this.dataSource.data = jobs;
      this.allJobs = jobs; // Store for filtering
      this.loading = false;
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      this.loading = false;
    }
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData(this.currentPage, this.pageSize);
  }
  applyFilter(filteredJobs: JobData[]) {
    // When filtering, we'll use client-side data and reset server pagination
    this.dataSource.data = filteredJobs;
    // Reset pagination info for filtered results
    if (this.paginationInfo) {
      this.totalItems = filteredJobs.length;
    }
  }

  navigateToDetail(job: JobData) {
    if (job.id) {
      this.router.navigate(['/job', job.id]);
    }
  }
}