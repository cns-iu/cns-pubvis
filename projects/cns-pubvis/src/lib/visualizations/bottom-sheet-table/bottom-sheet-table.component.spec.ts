import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSheetTableComponent } from './bottom-sheet-table.component';

describe('BottomSheetTableComponent', () => {
  let component: BottomSheetTableComponent;
  let fixture: ComponentFixture<BottomSheetTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottomSheetTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomSheetTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
