import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChaptersListComponent } from './chapters.component';

describe('ChaptersComponent', () => {
  let component: ChaptersListComponent;
  let fixture: ComponentFixture<ChaptersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChaptersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChaptersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
