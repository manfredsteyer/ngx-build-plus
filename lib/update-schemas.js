const fs = require("fs");
const path = require("path");

const BASE_URL =
  "https://raw.githubusercontent.com/angular/angular-cli/main/packages/angular_devkit/build_angular/src/builders/";

(async () => {
  await updateSchema("browser", "src/browser");
  await updateSchema("extract-i18n", "src/extract-i18n");
  await updateSchema("karma", "src/karma");
  await updateSchema("dev-server", "src/plus-dev-server");
  await updateSchema("server", "src/server");
})();

async function updateSchema(builder, targetUrl) {
  console.log("- Updating schema for", builder, "in", targetUrl);

  const url = path.join(BASE_URL, builder, "schema.json");
  const schema = await loadRemoteJson(url);

  const extSchemaUrl = `${targetUrl}/schema.ext.json`;
  const extSchema = loadLocalJson(extSchemaUrl);

  for (const prop in extSchema) {
    schema.properties[prop] = extSchema[prop];
  }

  const fullSchemaText = JSON.stringify(schema, null, 2);
  const fullSchemaUrl = `${targetUrl}/schema.json`;

  fs.writeFileSync(fullSchemaUrl, fullSchemaText, "utf8");
}

async function loadRemoteJson(url) {
  return await fetch(url).then((resp) => resp.json());
}

function loadLocalJson(extSchemaUrl) {
  return JSON.parse(fs.readFileSync(extSchemaUrl, { encoding: "utf8" }));
}
