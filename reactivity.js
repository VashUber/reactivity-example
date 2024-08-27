let currentEffect = null;
const weakMap = new WeakMap()

export const ref = (value) => {
  return reactive({value})
};

export const reactive = (obj) => {
  const effectsMap = new Map();

  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      
      if (typeof target === 'object' && !target.hasOwnProperty(prop)) return value

      if (currentEffect) {
        let deps = effectsMap.get(prop);
        if (!deps) {
          deps = new Set();
          effectsMap.set(prop, deps);
        }
        deps.add(currentEffect);
      }

      if (typeof value === 'object' && value !== null) {
        if (weakMap.has(value)) {
          return weakMap.get(value)
        }

        const r = reactive(value)
        weakMap.set(value, r)

        return r
      }

      return value;
    },
    set(target, prop, value, receiver) {
      const oldValue = target[prop];
      const result = Reflect.set(target, prop, value, receiver);

      if (oldValue !== value) {
        const deps = effectsMap.get(prop);

        if (deps) {
          deps.forEach(effect => effect());
        }
      }

      return result;
    }
  });
};

export const createEffect = (effect) => {
  currentEffect = effect;
  effect();
  currentEffect = null;
};