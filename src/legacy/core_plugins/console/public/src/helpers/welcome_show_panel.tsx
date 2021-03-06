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

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nContext } from 'ui/i18n';
import { WelcomePanel } from '../components/welcome_panel';
// @ts-ignore
import storage from '../storage';

let isOpen = false;

export function showWelcomePanel(): () => void {
  const onClose = () => {
    if (!container) return;
    ReactDOM.unmountComponentAtNode(container);
    isOpen = false;
  };

  const onDismiss = () => {
    storage.set('version_welcome_shown', '@@SENSE_REVISION');
    onClose();
  };

  const container = document.getElementById('consoleWelcomePanel');
  if (container && !isOpen) {
    isOpen = true;
    const element = (
      <I18nContext>
        <WelcomePanel onDismiss={onDismiss} />
      </I18nContext>
    );
    ReactDOM.render(element, container);
  }

  return onClose;
}
