import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAsesor } from './dashboard-asesor';

describe('DashboardAsesor', () => {
  let component: DashboardAsesor;
  let fixture: ComponentFixture<DashboardAsesor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAsesor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAsesor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
