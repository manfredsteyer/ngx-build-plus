import { BuilderConfiguration } from "@angular-devkit/architect";

export type ConfigHookFn = (cfg: object) => object;

export type Plugin<O, N> = {
    /**
     * Called before webpack configuration is created
     * Receives the normalized and merged build configuration over multiple targets
     *
     * @param normalizedBuilderConfig
     */
    preConfig?(normalizedBuilderConfig: N): void;
    /**
     * Called after webpack configuration was created
     *
     * @param cfg
     */
    config?(cfg: object): object;
    pre?(builderConfig: BuilderConfiguration<O>): void;
    post?(builderConfig: BuilderConfiguration<O>): void
};
