/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { getOr } from 'lodash/fp';
import * as React from 'react';
import { MockedProvider } from 'react-apollo/test-utils';
import { Provider as ReduxStoreProvider } from 'react-redux';

import { apolloClientObservable, mockGlobalState, TestProviders } from '../../../../mock';
import { createStore, networkModel, State } from '../../../../store';

import { NetworkDnsTable } from '.';
import { mockData } from './mock';

describe('NetworkTopNFlow Table Component', () => {
  const loadPage = jest.fn();
  const state: State = mockGlobalState;

  let store = createStore(state, apolloClientObservable);

  beforeEach(() => {
    store = createStore(state, apolloClientObservable);
  });

  describe('rendering', () => {
    test('it renders the default NetworkTopNFlow table', () => {
      const wrapper = shallow(
        <ReduxStoreProvider store={store}>
          <NetworkDnsTable
            data={mockData.NetworkDns.edges}
            fakeTotalCount={getOr(50, 'fakeTotalCount', mockData.NetworkDns.pageInfo)}
            id="dns"
            loading={false}
            loadPage={loadPage}
            showMorePagesIndicator={getOr(
              false,
              'showMorePagesIndicator',
              mockData.NetworkDns.pageInfo
            )}
            totalCount={mockData.NetworkDns.totalCount}
            type={networkModel.NetworkType.page}
          />
        </ReduxStoreProvider>
      );

      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('Sorting', () => {
    test('when you click on the column header, you should show the sorting icon', () => {
      const wrapper = mount(
        <MockedProvider>
          <TestProviders store={store}>
            <NetworkDnsTable
              data={mockData.NetworkDns.edges}
              fakeTotalCount={getOr(50, 'fakeTotalCount', mockData.NetworkDns.pageInfo)}
              id="dns"
              loading={false}
              loadPage={loadPage}
              showMorePagesIndicator={getOr(
                false,
                'showMorePagesIndicator',
                mockData.NetworkDns.pageInfo
              )}
              totalCount={mockData.NetworkDns.totalCount}
              type={networkModel.NetworkType.page}
            />
          </TestProviders>
        </MockedProvider>
      );

      expect(store.getState().network.page.queries!.dns.dnsSortField).toEqual({
        direction: 'desc',
        field: 'queryCount',
      });

      wrapper
        .find('.euiTable thead tr th button')
        .first()
        .simulate('click');

      wrapper.update();

      expect(store.getState().network.page.queries!.dns.dnsSortField).toEqual({
        direction: 'asc',
        field: 'dnsName',
      });
      expect(
        wrapper
          .find('.euiTable thead tr th button')
          .first()
          .find('svg')
      ).toBeTruthy();
    });
  });
});
