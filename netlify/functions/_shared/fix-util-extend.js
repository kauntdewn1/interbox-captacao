import util from 'node:util';

const descriptor = Object.getOwnPropertyDescriptor(util, '_extend');

if (descriptor && (typeof descriptor.get === 'function' || typeof descriptor.set === 'function')) {
  Object.defineProperty(util, '_extend', {
    configurable: true,
    enumerable: false,
    writable: true,
    value(target, source) {
      if (target == null || typeof target !== 'object') {
        return target;
      }
      if (source == null || typeof source !== 'object') {
        return target;
      }
      return Object.assign(target, source);
    },
  });
}
