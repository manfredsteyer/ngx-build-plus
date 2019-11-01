import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalsDemoNewComponent } from './externals-demo-new.component';

describe('ExternalsDemoNewComponent', () => {
  let component: ExternalsDemoNewComponent;
  let fixture: ComponentFixture<ExternalsDemoNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalsDemoNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalsDemoNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
