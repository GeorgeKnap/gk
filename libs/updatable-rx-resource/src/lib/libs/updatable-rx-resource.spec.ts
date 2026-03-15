import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibsUpdatableRxResource } from './updatable-rx-resource';

describe('LibsUpdatableRxResource', () => {
  let component: LibsUpdatableRxResource;
  let fixture: ComponentFixture<LibsUpdatableRxResource>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibsUpdatableRxResource],
    }).compileComponents();

    fixture = TestBed.createComponent(LibsUpdatableRxResource);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
