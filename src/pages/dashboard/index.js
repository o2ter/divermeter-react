//
//  index.js
//
//  The MIT License
//  Copyright (c) 2021 - 2023 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import React from 'react';
import { View, useActivity, useToast } from '@o2ter/react-ui';

import Localization from '../../i18n/pages/dashboard';
import { useConfig } from '../../config';
import { useAsyncResource } from 'sugax';
import { useProto } from '../../proto';

export const Dashboard = () => {
  const [config, setConfig] = useConfig();
  const proto = useProto();
  const startActivity = useActivity();
  const { showError } = useToast();
  const localization = Localization.useLocalize();
  const { resource: schema } = useAsyncResource(async () => {
    try {
      return await proto.schema({ master: true });
    } catch (e) {
      showError(e);
    }
  });
  return (
    <View classes='flex-row flex-fill'>
      <View
        classes='bg-primary-900'
        style={{
          width: _.isNumber(config.sideMenuWidth) ? config.sideMenuWidth : 300,
        }}
      >
      </View>
      <View classes='bg-secondary-100 flex-fill'>
      </View>
    </View>
  );
};

export default Dashboard;