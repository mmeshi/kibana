/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { i18n } from '@kbn/i18n';
import { Action, ActionContext } from './action';
import { GetEmbeddableFactory, ViewMode } from '../types';
import { EmbeddableFactoryNotFoundError } from '../errors';

export const EDIT_PANEL_ACTION_ID = 'editPanel';

export class EditPanelAction extends Action {
  public readonly type = EDIT_PANEL_ACTION_ID;
  constructor(private readonly getEmbeddableFactory: GetEmbeddableFactory) {
    super(EDIT_PANEL_ACTION_ID);
    this.order = 15;
  }

  public getDisplayName({ embeddable }: ActionContext) {
    const factory = this.getEmbeddableFactory(embeddable.type);
    if (!factory) {
      throw new EmbeddableFactoryNotFoundError(embeddable.type);
    }
    return i18n.translate('embeddableApi.panel.editPanel.displayName', {
      defaultMessage: 'Edit {value}',
      values: {
        value: factory.getDisplayName(),
      },
    });
  }

  getIconType() {
    return 'pencil';
  }

  public async isCompatible({ embeddable }: ActionContext) {
    const canEditEmbeddable = Boolean(
      embeddable && embeddable.getOutput().editable && embeddable.getOutput().editUrl
    );
    const inDashboardEditMode = embeddable.getInput().viewMode === ViewMode.EDIT;
    return Boolean(canEditEmbeddable && inDashboardEditMode);
  }

  public execute() {
    return undefined;
  }

  public getHref({ embeddable }: ActionContext): string {
    const editUrl = embeddable ? embeddable.getOutput().editUrl : undefined;
    return editUrl ? editUrl : '';
  }
}
