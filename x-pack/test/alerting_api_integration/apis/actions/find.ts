/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import expect from '@kbn/expect';
import { ES_ARCHIVER_ACTION_ID, SPACE_1_ES_ARCHIVER_ACTION_ID } from './constants';
import { FtrProviderContext } from '../../ftr_provider_context';

export default function findActionTests({ getService }: FtrProviderContext) {
  const supertest = getService('supertest');
  const esArchiver = getService('esArchiver');

  describe('find', () => {
    before(() => esArchiver.load('actions/basic'));
    after(() => esArchiver.unload('actions/basic'));

    it('should return 200 with individual responses', async () => {
      await supertest
        .get(
          '/api/action/_find?search=test.index-record&search_fields=actionTypeId&fields=description'
        )
        .expect(200)
        .then((resp: any) => {
          expect(resp.body).to.eql({
            page: 1,
            perPage: 20,
            total: 1,
            data: [
              {
                id: ES_ARCHIVER_ACTION_ID,
                description: 'My action',
              },
            ],
          });
        });
    });

    it('should return 200 with individual responses in a space', async () => {
      await supertest
        .get(
          '/s/space_1/api/action/_find?search=test.index-record&search_fields=actionTypeId&fields=description'
        )
        .expect(200)
        .then((resp: any) => {
          expect(resp.body).to.eql({
            page: 1,
            perPage: 20,
            total: 1,
            data: [
              {
                id: SPACE_1_ES_ARCHIVER_ACTION_ID,
                description: 'My action',
              },
            ],
          });
        });
    });

    it('should not return encrypted attributes', async () => {
      await supertest
        .get('/api/action/_find?search=test.index-record&search_fields=actionTypeId')
        .expect(200)
        .then((resp: any) => {
          expect(resp.body).to.eql({
            page: 1,
            perPage: 20,
            total: 1,
            data: [
              {
                id: ES_ARCHIVER_ACTION_ID,
                description: 'My action',
                actionTypeId: 'test.index-record',
                config: {
                  unencrypted: `This value shouldn't get encrypted`,
                },
              },
            ],
          });
        });
    });
  });
}
