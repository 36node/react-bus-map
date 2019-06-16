# @36node/react-bus-map

React Map for Bus Platform

## Install

```bash
yarn add @36node/react-bus-map
```

## propTypes

- parks: PropTypes.array, // 停车场的数据信息
- vehicles: PropTypes.array, // 车辆的数据信息
- selectedVehicleId: PropTypes.string, // 用户选择的车辆
- onSelectVehicle: PropTypes.func, // 当用户点击 marker 时触发, 改变 selectedVehicleId
- onMapMoved: PropTypes.func, // 当用户拖动地图时触发,
- mapStyle: PropTypes.string, // 地图样式
- center: PropTypes.array, // 地图的起始 center
- zoom: PropTypes.number, // 地图的起始 zoom
- setIconFont: PropTypes.func, // 设置地区 icon,

## example

```js
import Map from "@36node/react-bus-map";

<Map
  vehicles={
    [
      {
        title: "name", /* 地图显示name */
        offset: [-20, -20] /* 地图显示偏移 */
        position: [119.866139, 29.357157] /* 地理位置坐标 */
      }
    ]
  }
  center={[119.866139, 29.357157]}
  zoom={11}
  onMapMoved={this.handleMapMoved}
  setIconFont={
    (selected, data) => (
      <IconFont
        type={icon}
        selected={selected}
        data={data}
        style={{ fontSize: "2rem", color: "#1890ff", }}
      />
    )
  }
/>
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

[0]: https://img.shields.io/npm/v/@36node/template-module.svg?style=flat
[1]: https://npmjs.com/package/@36node/template-module
[2]: https://img.shields.io/npm/dm/@36node/template-module.svg?style=flat
[3]: https://npmjs.com/package/@36node/template-module
