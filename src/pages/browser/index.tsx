//
//  index.tsx
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
import { View, Text, useParams, useToast, useActivity } from '@o2ter/react-ui';
import { useAsyncResource } from 'sugax';
import { TObject, TSchema, useProto } from '../../proto';
import { DataSheet } from '../../datasheet';
import { useConfig } from '../../config';
import { tsvParseRows } from 'd3-dsv';
import { deserialize } from 'proto.io/dist/client';

const defaultObjectReadonlyKeys = ['_id', '__v', '_created_at', '_updated_at'];

const decodeClipboardJsonData = (
  clipboard: DataTransfer | Clipboard,
) => {
  if (clipboard instanceof DataTransfer) {
    const json = clipboard.getData('application/json');
    if (!_.isEmpty(json)) return { type: 'json', data: deserialize(json) as Record<string, any>[] } as const;
  }
}
const decodeClipboardData = async (
  clipboard: DataTransfer | Clipboard,
) => {
  if (clipboard instanceof DataTransfer) {
    const text = clipboard.getData('text/plain');
    if (!_.isEmpty(text)) return { type: 'raw', data: tsvParseRows(text) } as const;
  }
  if (clipboard instanceof Clipboard) {
    const text = await clipboard.readText();
    if (!_.isEmpty(text)) return { type: 'raw', data: tsvParseRows(text) } as const;
  }
}

const BrowserBody: React.FC<{ schema: TSchema; className: string; }> = ({ schema, className }) => {

  const Proto = useProto();
  const _schema = schema?.[className];
  const _fields = _schema?.fields ?? {};
  const _columns = _.keys(_fields);

  const [config, setConfig] = useConfig() as any;
  const _columnWidths = config['column-widths']?.[className] ?? {};

  const startActivity = useActivity();
  const { showError } = useToast();

  const [filter, setFilter] = React.useState<any[]>([]);
  const [sort, setSort] = React.useState<Record<string, 1 | -1>>({ _id: 1 });
  const [limit, setLimit] = React.useState(100);

  const query = React.useMemo(() => {
    const query = Proto.Query(className, { master: true });
    for (const f of filter) query.filter(f);
    return query;
  }, [className, schema, filter]);

  const { resource: count } = useAsyncResource(() => query.count(), undefined, [className, query]);
  const { resource: objects } = useAsyncResource(() => startActivity(async () => {
    try {
      const relation = _.pickBy(_fields, type => !_.isString(type) && (type.type === 'pointer' || type.type === 'relation'));
      const _query = query.clone();
      _query.includes('*', ..._.map(relation, (type, key) => `${key}._id`));
      return await _query.sort(sort).limit(limit).find();
    } catch (e: any) {
      console.error(e);
      showError(e);
    }
  }), undefined, [query, sort, limit]);

  const [insertedObjs, setInsertedObjs] = React.useState<TObject[]>([]);
  const [updatedObjs, setUpdatedObjs] = React.useState<Record<string, TObject>>({});
  const [deletedObjs, setDeletedObjs] = React.useState<string[]>([]);
  React.useEffect(() => {
    setInsertedObjs([]);
    setUpdatedObjs({});
    setDeletedObjs([]);
  }, [objects]);

  const _objs = React.useMemo(() => _.map(_.filter(
    [...objects ?? [], ...insertedObjs],
    obj => !_.includes(deletedObjs, obj.objectId)), obj => updatedObjs[obj.objectId!] ?? obj,
  ), [objects, insertedObjs, updatedObjs, deletedObjs]);

  const ref = React.useRef<React.ComponentRef<typeof DataSheet>>(null);

  const setValue = async (obj: TObject, column: string, value: any) => {
    if (Proto.isObject(value)) {
      obj.set(column, await value.fetch());
    } else if (_.isArray(value) && _.every(value, v => Proto.isObject(v))) {
      obj.set(column, await Promise.all(_.map(value, v => v.fetch())));
    } else {
      obj.set(column, value);
    }
  }

  const saveUpdates = async (updates: TObject[]) => {
    const ids = _.compact(_.map(updates, v => v.objectId));
    await Promise.all(_.map(updates, v => v.save({ master: true })));
    const _inserted = _.filter(updates, v => !_.includes(ids, v.objectId));
    const _updated = _.filter(updates, v => _.includes(ids, v.objectId));
    if (!_.isEmpty(_inserted)) setInsertedObjs(objs => [...objs, ..._inserted]);
    if (!_.isEmpty(_updated)) setUpdatedObjs(objs => ({
      ...objs,
      ..._.fromPairs(_.map(_inserted, v => [v.objectId, v])),
    }));
  }

  return (
    <>
      <View classes='py-3 px-4 flex-row bg-secondary-600'>
        <View>
          <Text classes='text-secondary-200 font-monospace' style={{ fontSize: 10 }}>CLASS</Text>
          <Text>
            <Text classes='h1 text-white'>{className}</Text>
            {!_.isNil(count) && <Text
              classes='fs-small ml-3 text-secondary-200 font-monospace'
            >{count} objects</Text>}
          </Text>
        </View>
        <View>
        </View>
      </View>
      <View classes='flex-fill p-1 bg-secondary-100'>
        {_schema && <div className='flex-fill overflow-auto'>
          <DataSheet
            ref={ref}
            data={_objs}
            schema={_schema}
            columns={_columns}
            columnWidth={_columns.map(c => _columnWidths[c])}
            sort={sort}
            allowEditForCell={(row, col) => !_.includes(defaultObjectReadonlyKeys, _columns[col])}
            onColumnPressed={(e: any, column) => {
              setSort(sort => ({
                ...e.shiftKey ? _.omit(sort, column) : {},
                [column]: sort[column] === 1 ? -1 : 1,
              }));
            }}
            onColumnWidthChange={(col, width) => setConfig((c: any) => ({
              ...c,
              'column-widths': {
                ...c['column-widths'],
                [className]: {
                  ...c['column-widths']?.[className] ?? {},
                  [_columns[col]]: width,
                }
              }
            }))}
            onValueChanged={(value, row, column) => startActivity(async () => {
              try {
                let obj = _objs[row]?.clone() ?? Proto.Object(className);
                await setValue(obj, column, value);
                await saveUpdates([obj]);
                ref.current?.endEditing();
              } catch (e: any) {
                console.error(e);
                showError(e);
              }
            })}
            onPasteRows={(rows, clipboard) => startActivity(async () => {
              try {
                const { type, data } = decodeClipboardJsonData(clipboard) ?? await decodeClipboardData(clipboard) ?? {};
                const objects = _.compact(_.map(rows, row => _objs[row]));
                const updates: TObject[] = [];
                if (type === 'json') {
                  for (const [obj, values] of _.zip(objects, data)) {
                    const _obj = obj?.clone() ?? Proto.Object(className);
                    for (const [column, value] of _.toPairs(values)) {
                      if (!_.includes(defaultObjectReadonlyKeys, column)) {
                        await setValue(_obj, column, value);
                      }
                    }
                    updates.push(_obj);
                  }
                } else if (type === 'raw') {

                }
                await saveUpdates(updates);
              } catch (e: any) {
                console.error(e);
                showError(e);
              }
            })}
            onPasteCells={(cells, clipboard) => startActivity(async () => {
              try {
                const { data } = await decodeClipboardData(clipboard) ?? {};
                const _rows = _.range(cells.start.row, cells.end.row + 1);
                const objects = _.compact(_.map(_rows, row => _objs[row]));
                const updates: TObject[] = [];

                await saveUpdates(updates);
              } catch (e: any) {
                console.error(e);
                showError(e);
              }
            })}
            onDeleteRows={(rows) => startActivity(async () => {
              try {
                const ids = _.compact(_.map(rows, row => _objs[row]?.objectId));
                await Proto.Query(className, { master: true }).containsIn('_id', ids).deleteMany();
                setDeletedObjs(_objs => [..._objs, ...ids]);
                setUpdatedObjs(objs => _.omit(objs, ...ids));
                ref.current?.clearSelection();
              } catch (e: any) {
                console.error(e);
                showError(e);
              }
            })}
            onDeleteCells={(cells) => startActivity(async () => {
              try {
                const _rows = _.range(cells.start.row, cells.end.row + 1);
                const _cols = _.range(cells.start.col, cells.end.col + 1)
                  .map(c => _columns[c])
                  .filter(c => !_.includes(defaultObjectReadonlyKeys, c));
                const updated = await Promise.all(_.map(_rows, row => {
                  let obj = _objs[row]?.clone();
                  if (!obj?.objectId) return;
                  obj = updatedObjs[obj.objectId]?.clone() ?? obj;
                  for (const _col of _cols) obj.set(_col, null);
                  return obj.save({ master: true });
                }));
                setUpdatedObjs(objs => ({
                  ...objs,
                  ..._.fromPairs(_.map(_.compact(updated), obj => [obj.objectId, obj])),
                }));
                ref.current?.clearSelection();
              } catch (e: any) {
                console.error(e);
                showError(e);
              }
            })}
          />
        </div>}
      </View>
    </>
  );
};

export const Browser: React.FC<{ schema: TSchema; }> = ({ schema }) => {
  const { class: className = '' } = useParams();
  return (
    <BrowserBody key={className} className={className} schema={schema} />
  );
};