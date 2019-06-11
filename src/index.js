import React from "react";
import { Map, Markers } from "react-amap";
import PropTypes from "prop-types";
import { has, isEqual } from "lodash";

import { AMAP_KEY } from "./config";
import ClusterPoint from "./cluster";
import Iconfont from "./iconfont";

const MarkerLabel = ({ data, selected }) => (
  <div
    style={{
      background: "#27303E",
      color: "white",
      borderRadius: 5,
      padding: 5,
      position: "absolute",
      left: "50%",
      transform: "translate(-50%, -110%)",
      whiteSpace: "nowrap",
      fontSize: "1rem",
    }}
  >
    {data.title || "暂无数据"}
  </div>
);

const MarkerIcon = ({ selected, data }) => {
  const { state = "RUNNING", type } = data;
  const icon = type === "park" ? "park" : `bus-${state.toLowerCase()}`;
  return (
    <Iconfont type={icon} selected={selected} style={{ fontSize: "1rem" }} />
  );
};
const AMAP_STYLE = "amap://styles/14ae2934af01871a240b06db5f4df292";

/**
 * 地图组件
 *
 * marker 的 extData 数据结构
 * {
 *   position: [data.location.lng, data.location.lat],
 *   title: data.no,
 *   offset: [0, 0],
 *   topWhenClick: true,
 *   state: "RUNNING",
 *   id: data.id,
 *   type: "vehicle",
 * }
 */

export default class BusMap extends React.Component {
  zoom = (this.props.options && this.props.options.zoom) || 11;
  vehicleMarkers = {};
  clusterMarkers = new Set();

  static propTypes = {
    parks: PropTypes.array, // 停车场的数据信息
    vehicles: PropTypes.array, // 车辆的数据信息
    selectedVehicleId: PropTypes.string, // 用户选择的车辆
    onSelectVehicle: PropTypes.func, // 当用户点击marker时触发, 改变selectedVehicleId
    onMapMoved: PropTypes.func, // 当用户拖动地图时触发,
    mapStyle: PropTypes.string, // 地图样式
    center: PropTypes.array, // 地图的起始center
  };

  // Set default props
  static defaultProps = {
    mapStyle: AMAP_STYLE,
  };

  mapEvents = {
    // 地图加载完运行
    moveend: () => {
      this.handleMoved();
    },
    created: map => {
      this._amap = map;
      this._amap.setFeatures(["bg", "road", "building"]);
    },
  };

  markerEvents = {
    created: allMarkers => {
      this.vehicleMarkers = {};
      allMarkers.forEach(marker => {
        if (marker.F && marker.F.extData)
          this.vehicleMarkers[marker.F.extData.id] = marker;
      });
    },
    click: (e, marker) => {
      marker.render(this.renderClickLayout);
      if (this.props.onSelectVehicle && has(marker, "F.extData.id")) {
        this.props.onSelectVehicle(marker.F.extData.id);
      }
    },
    mouseover: (e, marker) => {
      marker.render(this.renderMarkersLayout);
    },
    mouseout: (e, marker) => {
      marker.render(this.renderMarkersLayout);
    },
  };

  clusterOptions = {
    minClusterSize: 5,
    maxZoom: 16,
    zoomOnClick: true,
    gridSize: 200,
    averageCenter: true,
    renderCluserMarker: ({ markers, marker }) => {
      const vehicles = markers
        .filter(m => m && m.F && m.F.extData)
        .map(m => m.F.extData);
      vehicles.forEach(v => this.clusterMarkers.add(v.id));
      marker.setContent(ClusterPoint({ vehicles }));
    },
  };

  shouldComponentUpdate(nextProps) {
    if (!isEqual(nextProps.selectedVehicleId, this.props.selectedVehicleId)) {
      // 改变选中和取消选中的 marker
      this.selectedVehicleId = nextProps.selectedVehicleId;
      const oldM = this.vehicleMarkers[this.props.selectedVehicleId];
      const newM = this.vehicleMarkers[nextProps.selectedVehicleId];
      if (oldM) {
        oldM.setzIndex(100);
        oldM.render(this.renderMarkersLayout);
      }
      if (newM) {
        newM.setzIndex(101);
        this.moveto(newM.getPosition());
        newM.render(this.renderMarkersLayout);
      }
    }

    // 停车场数据有更新，刷新地图
    if (!isEqual(nextProps.parks, this.props.parks)) {
      return true;
    }

    // 如果有新的车辆则重绘
    for (const v of nextProps.vehicles) {
      if (!this.vehicleMarkers[v.id]) {
        return true;
      }
    }

    // 更新所有 marker 的外观和位置
    (nextProps.vehicles || []).forEach(this.update.bind(this));

    return false;
  }

  componentWillUnmount() {
    this.stopMove();
  }

  /**
   * 车辆动画
   *
   * @param {*} marker
   * @param {*} vehicle
   */
  update(vehicle) {
    const marker = this.vehicleMarkers[vehicle.id];
    if (!marker || !vehicle || !vehicle.position) return;

    // marker 状态变化
    const origin = marker.getExtData();
    if (origin && origin.state !== vehicle.state) {
      marker.setExtData(vehicle);
      marker.render(this.renderMarkersLayout);
    }

    // 改变 marker 位置
    const newP = new window.AMap.LngLat(...vehicle.position);
    if (this.clusterMarkers.has(vehicle.id)) {
      marker.setPosition(newP);
    } else {
      const oldP = marker.getPosition();
      const distance = oldP.distance(newP);
      if (distance > 500) {
        marker.setPosition(newP);
      } else if (distance > 10) {
        try {
          marker.stopMove();
          marker.moveTo(newP, 100);
        } catch (err) {}
      }
    }
  }

  stopMove() {
    Object.values(this.vehicleMarkers).forEach(marker => marker.stopMove());
  }

  /**
   * 当地图移动或者缩放的时候
   */
  handleMoved = () => {
    const zoom = this._amap.getZoom();
    if (zoom !== this.zoom) {
      // 此时会重新聚合，正好清空 clusterMarkers set
      this.stopMove(); // 停止所有车辆动画
      this.clusterMarkers.clear();
      this.zoom = zoom;
    }

    const { onMapMoved } = this.props;
    if (onMapMoved) {
      const center = this._amap.getCenter();
      const bounds = this._amap.getBounds();
      const radius = center.distance(bounds.southwest);

      // 回调地图
      onMapMoved.call(this, {
        center,
        radius: radius / 1000,
        zoom,
      });
    }
  };

  /**
   * 移动地图
   */
  moveto = (position, level = 17) => {
    this.stopMove();
    this._amap.setZoom(level);
    this._amap.setCenter(position);
  };

  renderClickLayout = extData => {
    return (
      <div style={{ position: "relative" }}>
        <MarkerLabel selected data={extData} />
        <MarkerIcon selected data={extData} />
      </div>
    );
  };

  renderMarkersLayout = extData => {
    const selected = extData.id === this.selectedVehicleId;
    return (
      <div style={{ position: "relative" }}>
        {selected && <MarkerLabel selected data={extData} />}
        <MarkerIcon selected={selected} data={extData} />
      </div>
    );
  };

  render() {
    const { parks, vehicles, center = [121.474827, 31.219855] } = this.props;
    return (
      <Map
        amapkey={AMAP_KEY}
        mapStyle={this.props.mapStyle}
        events={this.mapEvents}
        center={center}
        zoom={this.zoom}
      >
        <Markers
          key="parks"
          markers={parks}
          render={this.renderMarkersLayout}
        />
        <Markers
          key="vehicles"
          markers={vehicles}
          events={this.markerEvents}
          render={this.renderMarkersLayout}
          useCluster={this.clusterOptions}
        />
      </Map>
    );
  }
}
