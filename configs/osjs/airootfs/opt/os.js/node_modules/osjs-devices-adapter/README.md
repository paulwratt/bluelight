# OS.js Devices Adapter

Adds access to the devices that are added to the system in OS.js V3.

# Installing

```
$ npm install --save osjs-devices-adapter
```

Then follow the [VFS Guide](https://manual.os-js.org/v3/guide/filesystem/#adding-mountpoints) but replace the `customAdapter` variable with `DevicesAdapter` and import/require `osjs-devices-adapter` instead of `custom-adapter`.

# Attributes

|Name|Default|Type|Description|
|---|---|---|---|
|`exclude`|[]|Array|Excludes drives from the listing.|
