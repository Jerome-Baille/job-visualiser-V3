import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobData, PaginationInfo } from '../interfaces';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { TableFilterComponent } from './table-filter.component';
import { JobService } from '../services/job.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-table',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, TableFilterComponent],
  templateUrl: './list-table.component.html'
})
export class ListTableComponent implements OnInit, AfterViewInit, OnDestroy {
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
  
  private destroy$ = new Subject<void>();
  private isNavigatingFromPaginator = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private jobService: JobService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Listen to URL query params changes and update the component state accordingly
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        // Skip if this navigation was triggered by our paginator
        // to avoid creating an infinite loop
        if (this.isNavigatingFromPaginator) {
          this.isNavigatingFromPaginator = false;
          return;
        }

        const pageParam = params.get('page');
        const pageSizeParam = params.get('pageSize');
        
        // Handle page
        if (pageParam) {
          // In URL we use 1-based index, in code we use 0-based index
          const page = parseInt(pageParam, 10);
          this.currentPage = page > 0 ? page - 1 : 0;
        } else {
          this.currentPage = 0;
        }

        // Handle page size
        if (pageSizeParam) {
          const size = parseInt(pageSizeParam, 10);
          this.pageSize = this.pageSizeOptions.includes(size) ? size : this.pageSize;
        }

        // Sync paginator if it's available
        this.syncPaginatorWithCurrentState();
        
        // Load the data for the current page
        this.loadJobs(this.currentPage, this.pageSize);
      });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    
    // Synchronize the paginator with the current component state
    this.syncPaginatorWithCurrentState();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Synchronizes the paginator with the current component state
   */
  private syncPaginatorWithCurrentState() {
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage;
      this.paginator.pageSize = this.pageSize;
    }
  }

  async loadJobs(page: number = 0, pageSize: number = 10) {
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
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      this.loading = false;
    }
  }

  onPageChange(event: PageEvent) {
    // Set flag to prevent processing the URL change
    this.isNavigatingFromPaginator = true;
    
    // Update component state
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    
    // Update URL query params and then load data directly
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage + 1, // URL uses 1-based indexing
        pageSize: this.pageSize
      },
      queryParamsHandling: 'merge',
    }).then(() => {
      // Load data directly instead of depending on URL change subscription
      this.loadJobs(this.currentPage, this.pageSize);
    });
  }

  applyFilter(filteredJobs: JobData[]) {
    // When filtering, we'll use client-side data and reset server pagination
    this.dataSource.data = filteredJobs;
    // Reset pagination info for filtered results
    if (this.paginationInfo) {
      this.totalItems = filteredJobs.length;
    }
    
    // Reset to first page when filtering
    if (this.paginator) {
      this.paginator.firstPage();
    }
    
    // Update URL to reflect we're on page 1
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1
      },
      queryParamsHandling: 'merge',
    });
  }
}
