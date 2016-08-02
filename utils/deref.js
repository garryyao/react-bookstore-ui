import ObjectIterator from 'recursive-iterator';
const KEY_REF = '$ref';

function register(list) {
  return list.reduce(function(map, obj, index) {
    if (obj.id) {
      map[obj.id] = [obj, index];
    }
    return map;
  }, {});
}

export default function dreference(source, ...refs) {
  // deep clone source object
  source = JSON.parse(JSON.stringify(source));

  const self = register(source);
  const otherRefs = register(refs.reduce(function(list, arr) {
    return list.concat(arr);
  }));

  for (let {parent, node, key, path, deep} of new ObjectIterator(source)) {
    // check for valid $ref property
    if (key === KEY_REF && (typeof node === 'string' || typeof node === 'number')) {
      const refNode = self[node] || otherRefs[node];

      if(refNode) {
        const [newNode, index] = refNode;
        Object.assign(parent, newNode);

        // clean up $ref key
        delete parent[KEY_REF];

        // detach nodes that are referenced by ourselves
        if(node in self) {
          source.splice(source.findIndex(function(item) {
            return item.id === node;
          }), 1);
        }
      }
    }
  }

  return source;
}