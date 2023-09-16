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
import { Icon, View, Text, useNavigate, useLocation } from '@o2ter/react-ui';
import Localization from '../../i18n/sidemenu';
import { useAuth } from '../../config';
import { Pressable } from 'react-native';

const Link = ({
  icon,
  iconName,
  selected,
  classes,
  onPress,
  label,
}) => {
  const [focus, setFocus] = React.useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setFocus(true)}
      onHoverOut={() => setFocus(false)}
    >
      <Text classes={[focus || selected ? 'text-white' : 'text-primary-200', classes]}>
        {icon && iconName && <Icon classes='mr-2' icon={icon} name={iconName} />}
        {label}
      </Text>
    </Pressable>
  );
}

const Section = ({ header, link, children }) => {
  const location = useLocation();
  const selected = link === location.pathname || _.includes(_.map(children, x => x.link), location.pathname);
  const navigate = useNavigate();
  return (
    <>
      {link ? (
        <Link classes='h4' selected={selected} label={header} onPress={() => navigate(link)} />
      ) : (
        <Text classes={[selected ? 'text-white' : 'text-primary-200', 'h4']}>{header}</Text>
      )}
      <View classes='border-left border-primary-200 pl-3'>
        {_.map(children, ({ key, link }) => (
          <Link key={key} label={key} selected={location.pathname === link} onPress={() => navigate(link)} />
        ))}
      </View>
    </>
  );
}

export const SideMenu = ({ schema }) => {
  const [, setAuth] = useAuth();
  const localization = Localization.useLocalize();
  const sections = [
    {
      header: 'Browser',
      children: _.map(_.keys(schema).sort(), key => ({ key, link: `/browser/${encodeURIComponent(key)}` })),
    },
    {
      header: 'Config',
      link: '/config',
    },
  ];
  return (
    <View classes='flex-fill' style={{ height: '100vh' }}>
      <View classes='flex-fill bg-primary-700 py-3 pl-4 pr-5 overflow-auto'>
        {_.map(sections, (section, i) => (
          <View key={section.header} classes={i === 0 ? '' : 'mt-2'}>
            <Section {...section} />
          </View>
        ))}
      </View>
      <View classes='align-items-center py-2'>
        <Link
          icon='MaterialIcons'
          iconName='logout'
          onPress={() => { setAuth(); }}
          label={localization.string('logout')}
        />
      </View>
    </View>
  );
};
