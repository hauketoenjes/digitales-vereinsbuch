/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "file2036324795",
    "maxSelect": 1,
    "maxSize": 50000000,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "application/pdf"
    ],
    "name": "attachment",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "file2036324795",
    "maxSelect": 1,
    "maxSize": 50000000,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/gif",
      "image/webp",
      "application/pdf"
    ],
    "name": "attachment",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})
