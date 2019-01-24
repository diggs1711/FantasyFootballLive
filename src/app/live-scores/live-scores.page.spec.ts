import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveScoresPage } from './live-scores.page';

describe('LiveScoresPage', () => {
  let component: LiveScoresPage;
  let fixture: ComponentFixture<LiveScoresPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveScoresPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveScoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
