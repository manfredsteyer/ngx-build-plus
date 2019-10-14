
export type ConfigHookFn = (cfg: object) => object;

export type Plugin = {
    config?(cfg: object, options?: object): object;
    pre?(builderConfig): void;
    post?(builderConfig): void
};