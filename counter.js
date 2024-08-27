import { ref, createEffect } from "./reactivity";

const counter = ref(0)

export function setupCounter(element) {
  createEffect(() => {
    element.innerHTML = counter.value;
  });

  element.addEventListener("click", () => {
   counter.value++
  });
}
