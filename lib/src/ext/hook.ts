import { BuilderConfiguration } from "@angular-devkit/architect";

export type ConfigHookFn = (cfg: object) => object;

export type Plugin<O, N> = {
    preConfig?(normalizedBuilderConfig: N): void;
    config?(cfg: object): object;
    pre?(builderConfig: BuilderConfiguration<O>): void;
    post?(builderConfig: BuilderConfiguration<O>): void
};
