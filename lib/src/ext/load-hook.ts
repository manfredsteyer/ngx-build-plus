export function loadHook<T>(hook: string): T {
    if (hook.startsWith('~')) {
      hook = process.cwd() + '/' + hook.substr(1);
    }
    return require(hook).default as T;
}