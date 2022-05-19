import { inject } from "vue-demi";
import type { InjectionKey } from "vue-demi";

export function useContext<T>(context: InjectionKey<T>, component: string) {
  const injectionContext = inject(context, null);
  if (context === null) {
    const err = new Error(`<${component} /> is missing a parent component.`);
    if (Error.captureStackTrace) Error.captureStackTrace(err, useContext);
    throw err;
  }
  return injectionContext;
}
