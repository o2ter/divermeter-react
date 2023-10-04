//
//  base.tsx
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
import { Text, Overlay, useTheme, useDocumentEvent } from '@o2ter/react-ui';
import { Row } from '@o2ter/wireframe';
import { LayoutRectangle } from 'react-native';

type MenuButtonProps = {
  title: string;
  menu: React.ReactNode
};

const isChildNode = (parent?: Node | null, node?: Node | EventTarget | null) => {
  if (!parent) return false;
  while (node !== document) {
    if (node === parent) {
      return true;
    }
    const parentNode = node && 'parentNode' in node ? node.parentNode : null;
    if (!parentNode) return false;
    node = parentNode;
  }
  return false;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  title,
  menu,
}) => {
  const theme = useTheme();
  const ref = React.useRef<React.ComponentRef<typeof Overlay>>(null);
  const ref2 = React.useRef<React.ComponentRef<typeof Row>>(null);
  const [showMenu, setShowMenu] = React.useState(false);
  const [containerLayout, setContainerLayout] = React.useState<LayoutRectangle>();
  const _extraData = [showMenu, containerLayout, menu];
  useDocumentEvent('mousedown', (e) => {
    const node = ref.current;
    const node2 = ref2.current;
    if (node && node2
      && !isChildNode(node as unknown as Node, e.target)
      && !isChildNode(node2 as unknown as Node, e.target)
    ) setShowMenu(false);
  });
  return (
    <Overlay
      ref={ref}
      extraData={React.useMemo(() => _extraData, _extraData)}
      render={(layout) => showMenu && (
        <Row
          ref={ref2}
          classes='position-absolute py-2 px-3 rounded-2 bg-primary-600'
          onLayout={(e) => setContainerLayout(e.nativeEvent.layout)}
          style={{
            top: layout.y + layout.height,
            left: layout.x + layout.width - (containerLayout?.width ?? 0) + theme.borderRadius['2'],
            opacity: containerLayout ? 1 : 0,
          }}
        >{menu}</Row>
      )}
    >
      <Text
        classes={['py-1 px-2', showMenu ? 'rounded-top-2 bg-primary-600' : '']}
        onPress={() => setShowMenu(v => !v)}
      >{title}</Text>
    </Overlay>
  );
}