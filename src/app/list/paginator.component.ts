import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent {
  @Input() nPages = 1;
  @Input() currentPage = 1;
  @Output() pageChange = new EventEmitter<number>();

  get pageNumbers(): number[] {
    return Array(this.nPages).fill(0).map((_, i) => i + 1);
  }

  firstPage() { this.pageChange.emit(1); }
  lastPage() { this.pageChange.emit(this.nPages); }
  nextPage() { if (this.currentPage < this.nPages) this.pageChange.emit(this.currentPage + 1); }
  prevPage() { if (this.currentPage > 1) this.pageChange.emit(this.currentPage - 1); }
}
