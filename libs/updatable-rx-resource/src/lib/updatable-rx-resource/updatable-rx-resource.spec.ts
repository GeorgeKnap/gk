import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdatableRxResource } from './updatable-rx-resource';

describe('UpdatableRxResource', () => {
  let component: UpdatableRxResource;
  let fixture: ComponentFixture<UpdatableRxResource>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatableRxResource],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatableRxResource);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
