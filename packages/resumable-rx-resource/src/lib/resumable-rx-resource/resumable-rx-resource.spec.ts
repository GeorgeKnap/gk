import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumableRxResource } from './resumable-rx-resource';

describe('ResumableRxResource', () => {
  let component: ResumableRxResource;
  let fixture: ComponentFixture<ResumableRxResource>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumableRxResource],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumableRxResource);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
