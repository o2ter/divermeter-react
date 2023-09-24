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
import { View, Text, useParams, useToast, useActivity, UncontrolledTextInput, useLocation, useModal } from '@o2ter/react-ui';
import { useAsyncResource } from 'sugax';
import { TObject, TSchema, useProto } from '../../proto';
import { DataSheet } from '../../components/datasheet';
import { useConfig } from '../../config';
import { tsvParseRows } from 'd3-dsv';
import { Decimal, deserialize, isObject } from 'proto.io/dist/client';
import { _typeOf } from '../../components/datasheet/type';
import { FilterButton } from './filter';
import { ConfirmModal } from '../../components/modal';

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

const BrowserBody: React.FC<{ schema: TSchema; className: string; state: any; }> = ({ schema, className, state }) => {

  const Proto = useProto();
  const _schema = schema?.[className];
  const _fields = _schema?.fields ?? {};
  const _columns = _.keys(_fields);

  const [config, setConfig] = useConfig() as any;
  const _columnWidths = config['column-widths']?.[className] ?? {};

  const setModal = useModal();

  const startActivity = useActivity();
  const { showError } = useToast();

  const readonlyKeys = [
    ...defaultObjectReadonlyKeys,
    ..._.keys(_.pickBy(_fields, type => !_.isString(type) && type.type === 'relation' && !_.isNil(type.foreignField))),
  ];

  const { filter: initialFilter } = state ?? {};

  const [filter, setFilter] = React.useState<any[]>(_.castArray(initialFilter ?? []));
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
      const files = _.pickBy(_fields, type => !_.isString(type) && type.type === 'pointer' && type.target === 'File');
      const _query = query.clone();
      _query.includes(
        '*',
        ..._.map(_.keys(relation), key => `${key}._id`),
        ..._.map(_.keys(files), key => `${key}.filename`),
      );
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
    if (isObject(value)) {
      obj.set(column, value.objectId ? await value.fetch({ master: true }) : value);
    } else if (_.isArray(value) && _.every(value, v => isObject(v))) {
      obj.set(column, await Promise.all(_.map(value, v => v.objectId ? v.fetch({ master: true }) : v)));
    } else {
      obj.set(column, value);
    }
  }

  const decodeRawValue = async (type: string, value: string) => {
    switch (type) {
      case 'boolean':
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        break;
      case 'number':
        {
          const number = parseFloat(value);
          if (_.isFinite(number)) return number;
          break;
        }
      case 'decimal':
        {
          const number = new Decimal(value);
          if (number.isFinite()) return number;
          break;
        }
      case 'string': return value;
      case 'date':
        {
          const date = new Date(value);
          if (_.isFinite(date.valueOf())) return date;
          break;
        }
      case 'object': return deserialize(value);
      case 'array': return deserialize(value);
      case 'pointer':
        if (!_.isEmpty(value)) return Proto.Object(className, value).fetch({ master: true });
        break;
      case 'relation':
        const _value = JSON.parse(value);
        if (_.isArray(_value) && _.every(_value, v => !_.isEmpty(v) && _.isString(v))) {
          return await Promise.all(_.map(_value, v => Proto.Object(className, v).fetch({ master: true })));
        }
        break;
      default: break;
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
      ..._.fromPairs(_.map(_updated, v => [v.objectId, v])),
    }));
  }

  return (
    <>
      <View classes='py-3 px-4 flex-row justify-content-between bg-secondary-600 text-secondary-200 font-monospace'>
        <View>
          <Text style={{ fontSize: 10 }}>CLASS</Text>
          <Text>
            <Text classes='h1 text-white'>{className}</Text>
            {!_.isNil(count) && <Text
              classes='fs-small ml-3'
            >{count} objects</Text>}
          </Text>
        </View>
        <View classes='justify-content-end'>
          <View classes='flex-row text-white'>
            <FilterButton filter={filter} setFilter={setFilter} />
            <View classes='bg-secondary-200 h-100 mx-3' style={{ width: 1 }} />
            <Text>Limit</Text>
            <UncontrolledTextInput
              classes='ml-1 p-0 border-0 rounded-0 bg-secondary-600'
              style={{ outline: 'none', color: 'white' } as any}
              value={`${limit}`}
              onChangeText={(text) => {
                const number = parseFloat(text);
                if (_.isFinite(number)) setLimit(number);
              }}
            />
          </View>
        </View>
      </View>
      <View classes='flex-fill p-1 bg-secondary-100'>
        {_schema && <div className='flex-fill overflow-auto'>
          <DataSheet
            ref={ref}
            data={_objs}
            schema={_schema}
            columns={_columns}
            columnWidth={_columns.map(c => _columnWidths[c] ?? 160)}
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
                  for (const [obj, values] of _.zip(objects, data ?? [])) {
                    const _obj = obj?.clone() ?? Proto.Object(className);
                    for (const [column, value] of _.toPairs(values)) {
                      if (!_.includes(readonlyKeys, column)) {
                        await setValue(_obj, column, value);
                      }
                    }
                    updates.push(_obj);
                  }
                } else if (type === 'raw') {
                  for (const [obj, values] of _.zip(objects, data ?? [])) {
                    const _obj = obj?.clone() ?? Proto.Object(className);
                    for (const [column = '', value] of _.zip(_columns, values)) {
                      if (!_.includes(readonlyKeys, column)) {
                        if (_.isNil(value)) {
                          if (_obj.objectId) _obj.set(column, null);
                        } else {
                          const _value = await decodeRawValue(_typeOf(_fields[column]) ?? '', value);
                          if (!_.isNil(_value)) _obj.set(column, _value as any);
                        }
                      }
                    }
                    updates.push(_obj);
                  }
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
                const _cols = _.range(cells.start.col, cells.end.col + 1).map(c => _columns[c]);
                const objects = _.compact(_.map(_rows, row => _objs[row]));
                const updates: TObject[] = [];
                for (const [obj, values] of _.zip(objects, data ?? [])) {
                  const _obj = obj?.clone() ?? Proto.Object(className);
                  for (const [column = '', value] of _.zip(_cols, values)) {
                    if (!_.includes(readonlyKeys, column)) {
                      if (_.isNil(value)) {
                        if (_obj.objectId) _obj.set(column, null);
                      } else {
                        const _value = await decodeRawValue(_typeOf(_fields[column]) ?? '', value);
                        if (!_.isNil(_value)) _obj.set(column, _value as any);
                      }
                    }
                  }
                  updates.push(_obj);
                }
                await saveUpdates(updates);
              } catch (e: any) {
                console.error(e);
                showError(e);
              }
            })}
            onDeleteRows={(rows) => {
              const ids = _.compact(_.map(rows, row => _objs[row]?.objectId));
              const deleteAction = () => startActivity(async () => {
                try {
                  await Proto.Query(className, { master: true }).containsIn('_id', ids).deleteMany();
                  setDeletedObjs(_objs => [..._objs, ...ids]);
                  setUpdatedObjs(objs => _.omit(objs, ...ids));
                  ref.current?.clearSelection();
                } catch (e: any) {
                  console.error(e);
                  showError(e);
                }
              });
              if (ids.length <= 3) return deleteAction();
              setModal(
                <ConfirmModal
                  title='Delete selected rows'
                  comfirmMessage='To comfirm, type the class name in the box bellow'
                  comfirmAnswer={className}
                  onCancel={() => setModal()}
                  onConfirm={() => {
                    setModal();
                    deleteAction();
                  }}
                />
              );
            }}
            onDeleteCells={(cells) => {
              const _rows = _.range(cells.start.row, cells.end.row + 1);
              const _cols = _.range(cells.start.col, cells.end.col + 1)
                .map(c => _columns[c])
                .filter(c => !_.includes(readonlyKeys, c));
              const deleteAction = () => startActivity(async () => {
                try {
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
              });
              if (_rows.length * _cols.length <= 3) return deleteAction();
              setModal(
                <ConfirmModal
                  title='Delete selected data'
                  comfirmMessage='To comfirm, type the class name in the box bellow'
                  comfirmAnswer={className}
                  onCancel={() => setModal()}
                  onConfirm={() => {
                    setModal();
                    deleteAction();
                  }}
                />
              );
            }}
          />
        </div>}
      </View>
    </>
  );
};

export const Browser: React.FC<{ schema: TSchema; }> = ({ schema }) => {
  const { class: className = '' } = useParams();
  const { state } = useLocation();
  const id = React.useMemo(() => _.uniqueId(), [state, className]);
  return (
    <BrowserBody key={id} className={className} schema={schema} state={state} />
  );
};