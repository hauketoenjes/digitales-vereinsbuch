/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @request.auth.id = accountId.ownerId",
    "deleteRule": "@request.auth.id != \"\" && @request.auth.id = accountId.ownerId",
    "listRule": "@request.auth.id != \"\" && @request.auth.id = accountId.ownerId",
    "updateRule": "@request.auth.id != \"\" && @request.auth.id = accountId.ownerId",
    "viewRule": "@request.auth.id != \"\" && @request.auth.id = accountId.ownerId"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

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
