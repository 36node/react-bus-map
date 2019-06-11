# @36node/react-bus-map

## Install

```bash
yarn add @36node/react-bus-map
```

## propTypes

parks: PropTypes.array, // 停车场的数据信息
vehicles: PropTypes.array, // 车辆的数据信息
selectedVehicleId: PropTypes.string, // 用户选择的车辆
onSelectVehicle: PropTypes.func, // 当用户点击 marker 时触发, 改变 selectedVehicleId
onMapMoved: PropTypes.func, // 当用户拖动地图时触发,
mapStyle: PropTypes.string, // 地图样式
center: PropTypes.array, // 地图的起始 center
zoom: PropTypes.int, // 地图的起始 zoom

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

**module** © [36node](https://github.com/36node), Released under the [MIT](./LICENSE) License.

Authored and maintained by 36node with help from contributors ([list](https://github.com/36node/module/contributors)).

> [github.com/zzswang](https://github.com/zzswang) · GitHub [@36node](https://github.com/36node)

[0]: https://img.shields.io/npm/v/@36node/template-module.svg?style=flat
[1]: https://npmjs.com/package/@36node/template-module
[2]: https://img.shields.io/npm/dm/@36node/template-module.svg?style=flat
[3]: https://npmjs.com/package/@36node/template-module
