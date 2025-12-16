import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfterRegisterComponent } from './after-register.component';

describe('AfterRegisterComponent', () => {
  let component: AfterRegisterComponent;
  let fixture: ComponentFixture<AfterRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfterRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfterRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
