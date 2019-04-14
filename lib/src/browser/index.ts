import { buildWebpackBrowser, BrowserBuilderSchema } from "@angular-devkit/build-angular";
import { BuilderContext, BuilderOutput, BuilderHandlerFn, createBuilder } from "@angular-devkit/architect";
import { Observable } from 'rxjs';
import { BrowserBuilderSchemaPlus } from "./schema";
import { Transforms, runBuilderHandler } from "../utils";
import { JsonObject } from "@angular-devkit/core";


function buildWebpackBrowserPlus(
  options: BrowserBuilderSchemaPlus,
  context: BuilderContext,
  transforms: Transforms = {}
): Observable<BuilderOutput> {

    return runBuilderHandler(options, transforms, context, buildWebpackBrowser);

}


export default createBuilder<JsonObject & BrowserBuilderSchemaPlus>(buildWebpackBrowserPlus);