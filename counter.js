let currentEffect = null;
const weakMap = new WeakMap()

const ref = (value) => {
  if (typeof value === 'object' && value !== null) {
    return reactive(value);
  }

  const obj = { value };
  const effects = new Set();

  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (currentEffect) {
        effects.add(currentEffect);
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      effects.forEach(effect => effect());
      return result;
    }
  });
};

const reactive = (obj) => {
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

const createEffect = (effect) => {
  currentEffect = effect;
  effect();
  currentEffect = null;
};

const obj = ref({
  id: 1,
  person: {
    name: "egor",
    city: {
      name: "samara"
    }
  }
});

export function setupCounter(element) {
  createEffect(() => {
    element.innerHTML = JSON.stringify(obj);
  });

  element.addEventListener("click", () => {
    obj.person.city.name = "aboba"
    obj.person.name = "aboba"
  });
}
