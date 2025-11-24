import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailAsesor } from './detail-asesor';

describe('DetailAsesor', () => {
  let component: DetailAsesor;
  let fixture: ComponentFixture<DetailAsesor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailAsesor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailAsesor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
