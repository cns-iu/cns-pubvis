import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CNSPubVisComponent } from './cns-pubvis.component';

describe('CNSPubVisComponent', () => {
  let component: CNSPubVisComponent;
  let fixture: ComponentFixture<CNSPubVisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CNSPubVisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CNSPubVisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
