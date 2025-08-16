import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolGradesComponent } from './school-grades.component';

describe('SchoolGradesComponent', () => {
  let component: SchoolGradesComponent;
  let fixture: ComponentFixture<SchoolGradesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolGradesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolGradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
