import { executeDevServerBuilder } from "@angular-devkit/build-angular";
import { BuilderContext, BuilderOutput, BuilderHandlerFn, createBuilder } from "@angular-devkit/architect";
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
      executeDevServerBuilder);
    
}


export default createBuilder<JsonObject>(serveWebpackBrowserPlus);
