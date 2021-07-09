import { executeServerBuilder } from "@angular-devkit/build-angular";
import { BuilderContext, BuilderOutput, createBuilder } from "@angular-devkit/architect";
import { Observable } from 'rxjs';
import { Transforms, runBuilderHandler } from "../utils";
import { JsonObject } from "@angular-devkit/core";

export function serveWebpackBrowserPlus(
  options: any,
  context: BuilderContext,
  transforms: Transforms = {}
): Observable<BuilderOutput> {
    return runBuilderHandler(
      options, 
      transforms, 
      context, 
      executeServerBuilder);
}

export default createBuilder<JsonObject>(serveWebpackBrowserPlus);
