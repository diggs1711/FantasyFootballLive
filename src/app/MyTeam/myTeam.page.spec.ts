import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTeamPage } from './myTeam.page';

describe('MyTeamPage', () => {
	let component: MyTeamPage;
	let fixture: ComponentFixture<MyTeamPage>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				declarations: [ MyTeamPage ],
				schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(MyTeamPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
