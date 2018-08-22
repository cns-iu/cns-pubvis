import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoauthorNetworkLegendComponent } from './coauthor-network-legend.component';

describe('CoauthorNetworkLegendComponent', () => {
  let component: CoauthorNetworkLegendComponent;
  let fixture: ComponentFixture<CoauthorNetworkLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoauthorNetworkLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoauthorNetworkLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
