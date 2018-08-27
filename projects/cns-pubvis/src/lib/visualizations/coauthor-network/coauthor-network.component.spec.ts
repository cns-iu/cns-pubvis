import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoauthorNetworkComponent } from './coauthor-network.component';

describe('CoauthorNetworkComponent', () => {
  let component: CoauthorNetworkComponent;
  let fixture: ComponentFixture<CoauthorNetworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoauthorNetworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoauthorNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
