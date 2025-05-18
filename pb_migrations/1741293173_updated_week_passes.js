/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1686294183")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "bool1114567570",
    "name": "staff",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1686294183")

  // remove field
  collection.fields.removeById("bool1114567570")

  return app.save(collection)
})
