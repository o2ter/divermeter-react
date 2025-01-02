//
//  index.tsx
//
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { Text, View } from '@o2ter/react-ui';

import Localization from '../../i18n/NotFound';

export default function NotFound() {

  const { string: t } = Localization.useLocalize();

  return (
    <View classes='align-items-center justify-content-center' style={{ flex: 1 }}>
      <Text classes='display-1 fw-bold'>404</Text>
      <Text classes='fs-3 fw-bold'>{t('NotFoundMessage')}</Text>
    </View>
  );
}
