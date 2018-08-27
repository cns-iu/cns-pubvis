import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MavPubUiComponent } from './cns-pubvis-ui.component';

describe('MavPubUiComponent', () => {
  let component: MavPubUiComponent;
  let fixture: ComponentFixture<MavPubUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MavPubUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MavPubUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
