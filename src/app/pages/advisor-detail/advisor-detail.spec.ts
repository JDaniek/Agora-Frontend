import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvisorDetailComponent } from './advisor-detail';

describe('AdvisorDetail', () => {
  let component: AdvisorDetailComponent;
  let fixture: ComponentFixture<AdvisorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvisorDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvisorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
