import _ from 'lodash';
import { TDataType } from '../proto';


export const typeOf = (x?: TDataType) => _.isString(x) ? x : x?.type;
