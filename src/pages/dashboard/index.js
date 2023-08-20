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
import { shiftColor, useTheme } from '@o2ter/react-ui/dist/index.web';
import { useConfig } from '../../config';
import { useAsyncResource } from 'sugax/dist/index.web';
import { useProto } from '../../proto';

export const Dashboard = () => {
  const [config, setConfig] = useConfig();
  const proto = useProto();
  const theme = useTheme();
  const startActivity = useActivity();
  const { showError } = useToast();
  const localization = Localization.useLocalize();
  const { resource: schema } = useAsyncResource(async () => {
    try {
      return await proto.schema({ master: true });
    } catch {
      setConfig({ user: null, pass: null });
    }
  });
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{
        width: _.isNumber(config.sideMenuWidth) ? config.sideMenuWidth : 300,
        backgroundColor: shiftColor(theme.themeColors.primary, theme.colorWeights['900']),
      }}>
      </View>
      <View style={{
        flex: 1,
        backgroundColor: shiftColor(theme.themeColors.secondary, theme.colorWeights['100']),
      }}>
      </View>
    </View>
  );
};

export default Dashboard;