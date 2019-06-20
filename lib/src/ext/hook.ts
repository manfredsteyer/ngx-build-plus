import { BuilderConfiguration } from "@angular-devkit/architect";
import { BrowserBuilderSchema } from "src/plus-dev-server";

export type ConfigHookFn = (cfg: object) => object;

export type Plugin = {
    preConfig?(builderConfig: BuilderConfiguration<BrowserBuilderSchema>): void;
    config?(cfg: object): object;
    pre?(builderConfig: BuilderConfiguration<BrowserBuilderSchema>): void;
    post?(builderConfig: BuilderConfiguration<BrowserBuilderSchema>): void
};
