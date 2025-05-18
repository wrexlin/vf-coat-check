/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_337184437")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool2040057020",
    "name": "printed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "bool70459610",
    "name": "telegram",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_337184437")

  // remove field
  collection.fields.removeById("bool2040057020")

  // remove field
  collection.fields.removeById("bool70459610")

  return app.save(collection)
})
