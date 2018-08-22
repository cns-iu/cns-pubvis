import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MavPubComponent } from './mav-pub.component';

describe('MavPubComponent', () => {
  let component: MavPubComponent;
  let fixture: ComponentFixture<MavPubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MavPubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MavPubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
