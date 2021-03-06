/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { drag, drop } from '../../lib/drag_n_drop/helpers';
import {
  clickOutsideFieldsBrowser,
  openFieldsBrowser,
  populateTimeline,
  filterFieldsBrowser,
} from '../../lib/fields_browser/helpers';
import {
  FIELDS_BROWSER_CATEGORIES_COUNT,
  FIELDS_BROWSER_CONTAINER,
  FIELDS_BROWSER_FIELDS_COUNT,
  FIELDS_BROWSER_SELECTED_CATEGORY_COUNT,
  FIELDS_BROWSER_SELECTED_CATEGORY_TITLE,
  FIELDS_BROWSER_TITLE,
} from '../../lib/fields_browser/selectors';
import { logout } from '../../lib/logout';
import { HOSTS_PAGE } from '../../lib/urls';
import { loginAndWaitForPage, DEFAULT_TIMEOUT } from '../../lib/util/helpers';

const defaultHeaders = [
  { id: '@timestamp' },
  { id: 'message' },
  { id: 'event.category' },
  { id: 'event.action' },
  { id: 'host.name' },
  { id: 'source.ip' },
  { id: 'destination.ip' },
  { id: 'user.name' },
];

describe('Fields Browser', () => {
  beforeEach(() => {
    loginAndWaitForPage(HOSTS_PAGE);
  });

  afterEach(() => {
    logout();
  });

  it('renders the fields browser with the expected title when the Fields button is clicked', () => {
    populateTimeline();

    openFieldsBrowser();

    cy.get(FIELDS_BROWSER_TITLE)
      .invoke('text')
      .should('eq', 'Customize Columns');
  });

  it('closes the fields browser when the user clicks outside of it', () => {
    populateTimeline();

    openFieldsBrowser();

    clickOutsideFieldsBrowser();

    cy.get(FIELDS_BROWSER_CONTAINER).should('not.exist');
  });

  it('displays the `default ECS` category (by default)', () => {
    populateTimeline();

    openFieldsBrowser();

    cy.get(FIELDS_BROWSER_SELECTED_CATEGORY_TITLE)
      .invoke('text')
      .should('eq', 'default ECS');
  });

  it('the `defaultECS` (selected) category count matches the default timeline header count', () => {
    populateTimeline();

    openFieldsBrowser();

    cy.get(FIELDS_BROWSER_SELECTED_CATEGORY_COUNT)
      .invoke('text')
      .should('eq', `${defaultHeaders.length}`);
  });

  it('displays a checked checkbox for all of the default timeline columns', () => {
    populateTimeline();

    openFieldsBrowser();

    defaultHeaders.forEach(header =>
      cy.get(`[data-test-subj="field-${header.id}-checkbox"]`).should('be.checked')
    );
  });

  it('removes the message field from the timeline when the user un-checks the field', () => {
    const toggleField = 'message';

    populateTimeline();

    cy.get(`[data-test-subj="header-text-${toggleField}"]`).should('exist');

    openFieldsBrowser();

    cy.get(`[data-test-subj="field-${toggleField}-checkbox"]`).uncheck();

    clickOutsideFieldsBrowser();

    cy.get(`[data-test-subj="header-text-${toggleField}"]`).should('not.exist');
  });

  it('displays the expected count of categories that match the filter input', () => {
    const filterInput = 'host.mac';

    populateTimeline();

    openFieldsBrowser();

    filterFieldsBrowser(filterInput);

    cy.get(FIELDS_BROWSER_CATEGORIES_COUNT)
      .invoke('text')
      .should('eq', '2 categories');
  });

  it('displays a search results label with the expected count of fields matching the filter input', () => {
    const filterInput = 'host.mac';

    populateTimeline();

    openFieldsBrowser();

    filterFieldsBrowser(filterInput);

    cy.get(FIELDS_BROWSER_FIELDS_COUNT)
      .invoke('text')
      .should('eq', '2 fields');
  });

  it('selects a search results label with the expected count of categories matching the filter input', () => {
    const category = 'host';

    populateTimeline();

    openFieldsBrowser();

    filterFieldsBrowser(`${category}.`);

    cy.get(FIELDS_BROWSER_SELECTED_CATEGORY_TITLE)
      .invoke('text')
      .should('eq', category);
  });

  it('displays a count of only the fields in the selected category that match the filter input', () => {
    const filterInput = 'host.geo.c';

    populateTimeline();

    openFieldsBrowser();

    filterFieldsBrowser(filterInput);

    cy.get(FIELDS_BROWSER_SELECTED_CATEGORY_COUNT)
      .invoke('text')
      .should('eq', '4');
  });

  it('adds a field to the timeline when the user clicks the checkbox', () => {
    const filterInput = 'host.geo.c';
    const toggleField = 'host.geo.city_name';

    populateTimeline();

    openFieldsBrowser();

    filterFieldsBrowser(filterInput);

    cy.get(`[data-test-subj="header-text-${toggleField}"]`).should('not.exist');

    cy.get(`[data-test-subj="field-${toggleField}-checkbox"]`).check();

    clickOutsideFieldsBrowser();

    cy.get(`[data-test-subj="header-text-${toggleField}"]`).should('exist');
  });

  it('adds a field to the timeline when the user drags and drops a field', () => {
    const filterInput = 'host.geo.c';
    const toggleField = 'host.geo.city_name';

    populateTimeline();

    openFieldsBrowser();

    filterFieldsBrowser(filterInput);

    cy.get(`[data-test-subj="header-text-${toggleField}"]`).should('not.exist');

    cy.get(`[data-test-subj="field-name-${toggleField}"]`).then(field => drag(field));

    cy.get(`[data-test-subj="headers-group"]`).then(headersDropArea => drop(headersDropArea));

    cy.get(`[data-test-subj="header-text-${toggleField}"]`, { timeout: DEFAULT_TIMEOUT }).should(
      'exist'
    );
  });

  it('resets all fields in the timeline when `Reset Fields` is clicked', () => {
    const filterInput = 'host.geo.c';
    const toggleField = 'host.geo.city_name';

    populateTimeline();

    openFieldsBrowser();

    filterFieldsBrowser(filterInput);

    cy.get(`[data-test-subj="header-text-${toggleField}"]`).should('not.exist');

    cy.get(`[data-test-subj="field-${toggleField}-checkbox"]`).check();

    clickOutsideFieldsBrowser();

    cy.get(`[data-test-subj="header-text-${toggleField}"]`).should('exist');

    openFieldsBrowser();

    cy.get('[data-test-subj="reset-fields"]').click();

    cy.get(`[data-test-subj="header-text-${toggleField}"]`).should('not.exist');
  });
});
