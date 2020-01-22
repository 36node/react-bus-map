import React from "react";
import { Map, Markers } from "react-amap";
import PropTypes from "prop-types";
import { has, isEqual } from "lodash";

const AMAP_STYLE = "amap://styles/14ae2934af01871a240b06db5f4df292";

const MarkerLabel = ({ data }) => (
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

const MarkerIcon = ({ selected, data, setIconFont }) => {
  return setIconFont ? (
    setIconFont(selected, data)
  ) : (
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAChElEQVRYR82XXW7TQBDHd5y8JRLhBIS3xGsJcwLaE5CcgHAC2hNQTkA4AeUEhBPQnoAi7Tp5I9ygkbJvzg6aaI38tR8uqcS++MHe2d/O138MrMOK4ziNougVY2yGiCMASGk7It4BwD1jbKW1vs2y7C7ULIR8mCTJGWPsPWOMniHrhjH2QQhBT+fyAsRxvIyi6J3PUNt7RFxKKS9de60A4/F4NBwOv3a4des5FB6l1Pl2u6UQNZYVgHO+AoDXD7l5y56VEGIeDJAkyZWJ+YnOP5qhnCC7ldXwwGQyGff7/V+nPLmwlef5881msy3bbgBwzq8B4M1jACDiFynlwgmQJAklyxMXACL+RkRyZ1HvKQBcAcAzD/i9EOKpFWA6nc56vR5lvnUh4jel1KKe1VQ1g8GAvOdM3MPhMF+v16vigEoIApJvt9/vx7aSMqVLMXZ5sJKMnQC01p+yLLtweSigcdkBfJsR8VJKuXQBBHjx4R6w1XIZ6J8AOOcXAPDRdkNKQCnlzOMBEiBSzNZV92IlB4zc/vCU0rlN5Yxqfnft11q/LMt1oxEF9AHqE/M6hDmcSnjkANgJISrvGwC+RCyMmyHkWM+IOCuGE8/tG1X0/2kB3SDUCx31IkwNyahpqzcA8KLjIbbM/6mUOmvroNaBxFQElZRTmAIAd3mep3UZbtWCurE4jhdRFH0OOMT6SV186h8+6lAa0jm9AETMOae5v2s+3AohvGN8EECgzP71Lg0sSqnUJtvlMAQB0IaQNlsYrrdbVw4FA5hQOMWKvtFav82y7Do0cTsBGAjr/0Lb0OkD6Qxga1KIaG02JwtBYailSTmbzckBiqRExGOsSQ27/JKXgf4AxENJMOhT4FoAAAAASUVORK5CYII="
      alt=""
    />
  );
};

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
  zoom = this.props.zoom || 11;
  vehicleMarkers = {};
  clusterMarkers = new Set();

  static propTypes = {
    parks: PropTypes.array, // 停车场的数据信息
    center: PropTypes.array, // 地图的起始center
    vehicles: PropTypes.array, // 车辆的数据信息
    mapStyle: PropTypes.string, // 地图样式
    mapKey: PropTypes.string, // 地图key
    onMapMoved: PropTypes.func, // 当用户拖动地图时触发,
    onSelectVehicle: PropTypes.func, // 当用户点击marker时触发, 改变selectedVehicleId
    selectedVehicleId: PropTypes.string, // 用户选择的车辆
    setIconFont: PropTypes.func, // 设置车辆icon
    zoom: PropTypes.number, // 地图的起始zoom
    clusterComponent: PropTypes.func, // 聚合marker component
    minClusterSize: PropTypes.number, // 聚合点minClusterSize,
    gridSize: PropTypes.number, // 聚合点gridSize,
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
        const { id } = marker.getExtData() || {};
        if (id) {
          this.vehicleMarkers[id] = marker;
        }
      });
    },
    click: (e, marker) => {
      marker.render(this.renderClickLayout);
      const extData = marker.getExtData();
      if (this.props.onSelectVehicle && has(extData, "id")) {
        this.props.onSelectVehicle(extData.id);
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
    minClusterSize: this.props.minClusterSize || 5,
    maxZoom: 16,
    zoomOnClick: true,
    gridSize: this.props.gridSize || 120,
    averageCenter: true,
    renderCluserMarker: ({ markers, marker }) => {
      const vehicles = markers.map(m => m.getExtData()).filter(v => v);
      vehicles.forEach(v => this.clusterMarkers.add(v.id));

      if (this.props.clusterComponent) {
        marker.setContent(this.props.clusterComponent({ vehicles }));
      }
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
        } catch (err) {
          marker.stopMove();
        }
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
    this.stopMove(); // 停止所有车辆动画

    if (zoom !== this.zoom) {
      // 此时会重新聚合，正好清空 clusterMarkers set
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
        <MarkerIcon
          selected
          data={extData}
          setIconFont={this.props.setIconFont}
        />
      </div>
    );
  };

  renderMarkersLayout = extData => {
    const selected = extData.id === this.selectedVehicleId;

    return (
      <div style={{ position: "relative" }}>
        {extData.id && (this.props.fixedTitle || selected) && (
          <MarkerLabel selected data={extData} />
        )}
        <MarkerIcon
          selected={selected}
          data={extData}
          setIconFont={this.props.setIconFont}
        />
      </div>
    );
  };

  render() {
    const {
      parks,
      vehicles,
      center = [121.474827, 31.219855],
      mapKey,
    } = this.props;

    return (
      <Map
        version="1.4.15"
        amapkey={mapKey}
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
