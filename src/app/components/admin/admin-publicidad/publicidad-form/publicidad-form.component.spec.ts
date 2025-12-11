import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicidadFormComponent } from './publicidad-form.component';

describe('PublicidadFormComponent', () => {
  let component: PublicidadFormComponent;
  let fixture: ComponentFixture<PublicidadFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicidadFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicidadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
