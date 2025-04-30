import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobBoardsComponent } from './job-boards.component';

describe('JobBoardsComponent', () => {
  let component: JobBoardsComponent;
  let fixture: ComponentFixture<JobBoardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobBoardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobBoardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
