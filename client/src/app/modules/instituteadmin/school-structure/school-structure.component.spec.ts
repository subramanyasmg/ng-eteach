import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolStructureComponent } from './school-structure.component';

describe('SchoolStructureComponent', () => {
  let component: SchoolStructureComponent;
  let fixture: ComponentFixture<SchoolStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolStructureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
