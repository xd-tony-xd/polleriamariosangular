import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactoFormModalComponent } from './contacto-form-modal.component';

describe('ContactoFormModalComponent', () => {
  let component: ContactoFormModalComponent;
  let fixture: ComponentFixture<ContactoFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactoFormModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactoFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
