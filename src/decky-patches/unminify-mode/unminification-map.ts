import { classModuleMap } from "@decky/ui";

// classModuleMap is a hashmap of MODULE_ID -> Record<UNMINIFIED_CLASSNAME, MINIFIED_CLASS>
// What we want in the end is a hashmap of MINIFIED_CLASS -> `${UNMINIFIED_MODULE_ID}__${UNMINIFIED_CLASSNAME}`

// Take each entry in classModuleMap, begin by mapping it's module id to the backend-provided unminified module prefix
// Then, for each class in the module, add entries to the final has map that have the minified class as the key and the unminified string as the value

// These types are mostly just so that I can remember what each string represents
type WebpackModuleId = string;
type WebpackClassName = string;
type PythonModuleName = string;
type MinifiedClass = string;
type UnminifiedClass = `${PythonModuleName}_${string}`;

export type PythonMappings = Record<WebpackModuleId, { name: PythonModuleName }>;
type WebpackModule = Record<WebpackClassName, MinifiedClass>;

export var unminificationMap = new Map<MinifiedClass, UnminifiedClass>();

export function initializeUnminificationMap(pythonMappings: PythonMappings) {
  classModuleMap.forEach((obj: WebpackModule, key: WebpackModuleId) => {
    const mappedModulename = pythonMappings[key]?.name;
    // If the module name is not in the mappings, skip it (because the backend won't be able to resolve it anyways)
    if (!mappedModulename) return;
    Object.entries(obj).forEach(([webpackClassName, minifiedClass]) => {
      // The modules also often contain hardcoded sizes (eg: 800px), so this filters those out
      if (!isNaN(Number(minifiedClass.charAt(0)))) return;

      const unminifiedClass = `${mappedModulename}_${webpackClassName}` as UnminifiedClass;
      unminificationMap.set(minifiedClass, unminifiedClass);
    });
  });
  return unminificationMap;
}
