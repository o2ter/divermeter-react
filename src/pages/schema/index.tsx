//
//  index.tsx
//
//  The MIT License
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
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
import { View, Text } from '@o2ter/react-ui';
import { Row } from '@o2ter/wireframe';
import { TSchema } from '../../proto';
import { LayoutRectangle, StyleSheet } from 'react-native';
import { flatternShape, typeStr } from '../../utils';

const s1 = 16;
const s2 = 12;
const p = 8;

export const Schema: React.FC<{ schema: TSchema; }> = ({ schema }) => {
  const [layout, setLayout] = React.useState<LayoutRectangle>();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const nodes = React.useMemo(() => _.map(schema, ({ fields }, name) => ({
    name,
    fields: _.map({
      ...flatternShape(fields),
      ...name === 'User' ? { password: 'string' } : {},
    } as ReturnType<typeof flatternShape>, (type, key) => ({
      key,
      type: typeStr(type) ?? '',
      _type: type,
    })),
  })), [schema]);

  const [nodePos, setNodePos] = React.useState<Record<string, { x: number; y: number; }>>({});
  const [nodeZ, setNodeZ] = React.useState<Record<string, number>>({});

  const [nodeBounding, setNodeBounding] = React.useState<Record<string, LayoutRectangle>>({});
  const [selectedNode, setSelectedNode] = React.useState<string>();
  const [startPos, setStartPos] = React.useState<{ x: number; y: number; }>();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const measureText = (font: string, text: string) => {
      ctx.font = font;
      return ctx.measureText(text);
    };

    const headerMetrics = measureText(`${s1}px font-monospace`, 'Text');
    const fieldMetrics = measureText(`${s2}px font-monospace`, 'Text');

    const headerHeight = headerMetrics.fontBoundingBoxAscent + headerMetrics.fontBoundingBoxDescent;
    const fieldHeight = fieldMetrics.fontBoundingBoxAscent + fieldMetrics.fontBoundingBoxDescent;

    const _nodes = _.map(nodes, x => ({
      ...x,
      width: Math.max(
        measureText(`${s1}px font-monospace`, x.name).width,
        ..._.map(x.fields, ({ key, type }) => measureText(`${s2}px font-monospace`, `${key}    ${type}`).width)
      ),
    })).map(x => ({
      ...x,
      posX: nodePos[x.name]?.x ?? 0,
      posY: nodePos[x.name]?.y ?? 0,
      width: x.width + p * 2,
      height: x.fields.length * fieldHeight + headerHeight + p * 3,
    }));

    const nodeBounding: Record<string, LayoutRectangle> = {};
    for (const { posX, posY, width, height, ...node } of _.orderBy(_nodes, x => nodeZ[x.name] ?? 0)) {
      nodeBounding[node.name] = { x: posX, y: posY, width, height };
    }
    setNodeBounding(nodeBounding);

    for (const { name, posX, posY, width, height, fields } of _nodes) {
      for (const [i, { _type: type }] of fields.entries()) {
        if (_.isString(type)) continue;
        if (type.type !== 'pointer' && type.type !== 'relation') continue;
        const layout = nodeBounding[name];
        const targetLayout = nodeBounding[type.target];
        const _posY = posY + headerHeight + p * 2 + (i + 0.5) * fieldHeight;
        ctx.beginPath();
        ctx.moveTo(posX + p, _posY);
        if (layout.x + 0.5 * layout.width < targetLayout.x + 0.5 * targetLayout.width) {
          ctx.lineTo(posX + width - p + 25, _posY);
        } else {
          ctx.lineTo(posX + p - 25, _posY);
        }
        ctx.stroke();
      }
    }

    for (const { posX, posY, width, height, ...node } of _.orderBy(_nodes, x => nodeZ[x.name] ?? 0)) {
      setNodeBounding(v => ({ ...v, [node.name]: { x: posX, y: posY, width, height } }));
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.roundRect(posX, posY, width, height, [8]);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';
      ctx.font = `${s1}px font-monospace`;
      ctx.fillText(node.name, posX + width * 0.5, posY + headerMetrics.fontBoundingBoxAscent + p);
      for (const [i, field] of node.fields.entries()) {
        const _posY = posY + headerHeight + fieldMetrics.fontBoundingBoxAscent + p * 2 + i * fieldHeight;
        ctx.textAlign = 'start';
        ctx.fillStyle = 'black';
        ctx.font = `${s2}px font-monospace`;
        ctx.fillText(field.key, posX + p, _posY);
        ctx.textAlign = 'end';
        ctx.fillStyle = 'gray';
        ctx.font = `${s2}px font-monospace`;
        ctx.fillText(field.type, posX + width - p, _posY);
      }
    }
  }, [nodes, layout, nodePos, nodeZ]);

  return (
    <>
      <Row classes='py-3 px-4 justify-content-between bg-secondary-600 text-secondary-200 font-monospace'>
        <View>
          <Text style={{ fontSize: 10 }}>SYSTEM</Text>
          <Text classes='h5 text-white'>Schema</Text>
        </View>
      </Row>
      <View classes='flex-fill bg-secondary-100'>
        <View
          style={StyleSheet.absoluteFill}
          onLayout={(e) => setLayout(e.nativeEvent.layout)}
          onPointerDown={(e) => {
            const { offsetX, offsetY } = e.nativeEvent;
            const layouts = _.map(nodes, ({ name }) => ({ name, layout: nodeBounding[name] }));
            for (const { name, layout } of _.orderBy(layouts, x => nodeZ[x.name] ?? 0).reverse()) {
              if (!layout) continue;
              if (offsetX < layout.x || offsetX > layout.x + layout.width) continue;
              if (offsetY < layout.y || offsetY > layout.y + layout.height) continue;
              setNodeZ({ [name]: 1 });
              setSelectedNode(name);
              setStartPos({ x: offsetX - layout.x, y: offsetY - layout.y });
              break;
            }
          }}
          onPointerMove={(e) => {
            if (!selectedNode) return;
            const { offsetX, offsetY } = e.nativeEvent;
            const layout = nodeBounding[selectedNode] ?? {};
            setNodePos(v => ({
              ...v,
              [selectedNode]: {
                x: offsetX - (startPos?.x ?? 0),
                y: offsetY - (startPos?.y ?? 0),
              },
            }));
          }}
          onPointerUp={() => {
            setSelectedNode(undefined);
          }}
        >
          <div className='flex-fill overflow-auto'>
            <canvas ref={canvasRef} width={layout?.width} height={layout?.height} />
          </div>
        </View>
      </View>
    </>
  );
}