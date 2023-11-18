// The dev server re-evaluates modules on every change, this prevents re-evaluation.
// Borrowed/modified from https://github.com/epicweb-dev/remember

export function singleton<Value>(name: string, getValue: () => Value): Value {
  const thusly = globalThis as any;
  thusly.__singletons ??= new Map();
  if (!thusly.__singletons.has(name)) {
    thusly.__singletons.set(name, getValue());
  }
  return thusly.__singletons.get(name);
}
