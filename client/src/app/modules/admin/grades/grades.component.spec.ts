import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradesListComponent } from './grades.component';

describe('GradesComponent', () => {
  let component: GradesListComponent;
  let fixture: ComponentFixture<GradesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
