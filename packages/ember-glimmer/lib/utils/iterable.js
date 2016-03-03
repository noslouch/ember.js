import { get } from 'ember-metal/property_get';
import { guidFor } from 'ember-metal/utils';
import { UpdatableReference } from './references';

export default function iterableFor(ref, keyPath) {
  return new Iterable(ref, keyFor(keyPath));
}

function keyFor(keyPath) {
  let keyFor;

  switch (keyPath) {
    case '@index':
      return index;
    case '@identity':
    case undefined:
    case null:
      return identity;
    default:
      return (item) => get(item, keyPath);
  }
}

function index(item, index) {
  return String(index);
}

function identity(item) {
  switch (typeof item) {
    case 'string':
    case 'number':
      return String(item);
    default:
      return guidFor(item);
  }
}

class ArrayIterator {
  constructor(array, keyFor) {
    this.array = array;
    this.keyFor = keyFor;
    this.position = 0;
  }

  next() {
    let { position, array, keyFor } = this;

    if (position >= array.length) return null;

    let value = array[position];
    let key = keyFor(value, position);

    this.position++;

    return { key, value };
  }
}

class Iterable {
  constructor(ref, keyFor) {
    this.ref = ref;
    this.keyFor = keyFor;
  }

  iterate() {
    let { ref, keyFor } = this;

    let iterable = ref.value();

    if (Array.isArray(iterable)) {
      return iterable.length > 0 ? new ArrayIterator(iterable, keyFor) : null;
    } else if (iterable === undefined || iterable === null) {
      return null;
    } else {
      throw new Error(`Don't know how to {{#each ${iterable}}}`);
    }
  }

  isEmpty() {
    let { ref } = this;

    let iterable = ref.value();

    if (Array.isArray(iterable)) {
      return iterable.length === 0;
    } else {
      return true;
    }
  }

  referenceFor(item) {
    return new UpdatableReference(item.value);
  }

  updateReference(reference, item) {
    reference.update(item.value);
  }
}
