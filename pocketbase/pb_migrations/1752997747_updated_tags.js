/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1219621782")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @request.auth.id = ownerId",
    "deleteRule": "@request.auth.id != \"\" && @request.auth.id = ownerId",
    "listRule": "@request.auth.id != \"\" && @request.auth.id = ownerId",
    "updateRule": "@request.auth.id != \"\" && @request.auth.id = ownerId",
    "viewRule": "@request.auth.id != \"\" && @request.auth.id = ownerId"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1219621782")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
