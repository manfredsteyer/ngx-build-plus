import { executeBrowserBuilder } from "@angular-devkit/build-angular";
import { BuilderContext, BuilderOutput, createBuilder } from "@angular-devkit/architect";
import { Observable } from 'rxjs';
import { Transforms, runBuilderHandler } from "../utils";

function buildWebpackBrowserPlus(
  options: any,
  context: BuilderContext,
  transforms: Transforms = {}
): Observable<BuilderOutput> {
    return runBuilderHandler(options, transforms, context, executeBrowserBuilder);
}

export { buildWebpackBrowserPlus as executeBrowserBuilderPlus };
//export default createBuilder<JsonObject & BrowserBuilderSchemaPlus>(buildWebpackBrowserPlus);
export default createBuilder<any>(buildWebpackBrowserPlus);