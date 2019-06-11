/*global AMap */
import React from "react";
import PropTypes from "prop-types";
import isEqual from "lodash/isEqual";
import { has } from "lodash";
import { transParks, transVehicles } from "./utils";
import { AMAP_KEY } from "./config";
import { getClusterColor } from "./cluster";
import defer from "promise-defer";
import Iconfont from "./iconfont";
import ReactDOM from "react-dom";

// import styled from "styled-components";

// const busMarkers = []; // 汽车点实例列表
const AMAP_STYLE = "amap://styles/14ae2934af01871a240b06db5f4df292";

export default class BusMap extends React.Component {
  static propTypes = {
    parks: PropTypes.array, // 停车场的数据信息
    vehicles: PropTypes.array, // 车辆的数据信息
    selectedVehicle: PropTypes.object, // 用户选择的车辆
    onSelectVehicle: PropTypes.func, // 当用户点击marker时触发, 改变selectedVehicle
    onMapMoved: PropTypes.func, // 当用户拖动地图时触发,
  };

  defaultCenter = [121.474827, 31.219855];
  mapCreated = defer();
  // 用于存放已经渲染的marker
  parkMarkers = [];
  // 用id当key 快速查找
  vehicleMarkers = {};
  // 用于marker切换状态时的offset, 在amap加载后赋值
  markerDefaultOffset = "";
  markerSelectedOffset = "";
  // 用于存储已经点击的Marker 取消选中时避免设置所有Marker的状态
  selectedMarker = {};
  // 用于表示是否重新聚合
  shouldUpdateCluster = false;
  componentDidMount() {
    window.afterLoadAMap = () => {
      this._amap = new AMap.Map("container");
      this._amap.setFeatures(["bg", "road", "building"]);
      this._amap.setMapStyle(
        this.props.mapStyle ? this.props.mapStyle : AMAP_STYLE
      );
      // 初始化地图时拿一次车辆数据
      this._amap.on("complete", () => {
        this.moveto(this.defaultCenter, 9);
        this.mapCreated.resolve();
      });
      this._amap.on("moveend", this.handleMoved);
      this._amap.plugin(["AMap.MarkerClusterer"], () => {
        this.cluster = new AMap.MarkerClusterer(this._amap, [], {
          renderCluserMarker: this.renderCluserMarker,
          minClusterSize: 5,
          maxZoom: 16,
          zoomOnClick: true,
          gridSize: 100,
          averageCenter: true,
        });
      });
      this.markerDefaultOffset = new AMap.Pixel(-12.5, -25);
      this.markerSelectedOffset = new AMap.Pixel(-21, -54);
      this.clusterMarkerOffset = new AMap.Pixel(-20, -40);
    };
    const url = `https://webapi.amap.com/maps?v=1.4.10&key=${AMAP_KEY}&callback=afterLoadAMap`;
    const jsapi = document.createElement("script");
    jsapi.charset = "utf-8";
    jsapi.src = url;
    document.head.appendChild(jsapi);
  }
  shouldComponentUpdate(nextProps) {
    // 刷新标志位
    let result = false;
    // 如果拿到了新的选中点数据
    if (
      has(nextProps.selectedVehicle, "location") &&
      nextProps.selectedVehicle.id !== this.selectedMarker.id &&
      nextProps.selectedVehicle.location !== this.props.selectedVehicle.location
    ) {
      const marker = this.vehicleMarkers[nextProps.selectedVehicle.id];
      // 已选中车辆为中心点挪动地图 17zoom确保不会被聚合 这时不需要刷新 待获取了选中点周围的点后会刷新
      // TODO: 临时 fix，这里用原先 marker 的位置。
      // 之所以这么fix，是因为现在整个地图的 marker 并不会更新！
      // 当然也可以解决未来地图更新不及时的问题
      const center = marker
        ? marker.Ke.position
        : nextProps.selectedVehicle.location;

      this.mapCreated.promise.then(() =>
        this.moveto([center.lng, center.lat], 17)
      );
    }
    // 取消选中且没有选择新的点时
    if (!nextProps.selectedVehicle.id && this.selectedMarker.id) {
      this.selectedMarker.setContent(this.selectedMarker.defaultContent);
      this.selectedMarker.setOffset(this.markerDefaultOffset);
      this.selectedMarker.setzIndex(100);
      this.selectedMarker = {};
    }

    if (
      !isEqual(nextProps.parks, this.props.parks) ||
      !isEqual(nextProps.vehicles, this.props.vehicles)
    ) {
      // 如果新的车辆数据中有还没有创建Marker的数据
      if (nextProps.vehicles.some(el => !this.vehicleMarkers[el.id])) {
        this.shouldUpdateCluster = true;
      }

      if (this._amap) {
        transParks(nextProps.parks).forEach(el => this.addParkMarker(el));
        this.renderVehicles(transVehicles(nextProps.vehicles));
      } else {
        setTimeout(() => {
          transParks(nextProps.parks).forEach(el => this.addParkMarker(el));
          this.renderVehicles(transVehicles(nextProps.vehicles));
        }, 1000);
      }
      result = true;
    }

    return result;
  }
  componentDidUpdate(prevProps) {
    // 如果车辆数据或者选中点有变化
    if (
      prevProps.vehicles !== this.props.vehicles ||
      prevProps.selectedVehicle.id !== this.props.selectedVehicle.id
    ) {
      // 在渲染的点中找到选中点
      const marker = this.vehicleMarkers[this.props.selectedVehicle.id];
      // 如果当前渲染点中有选中点做以下操作,如果没有选中点, 待获取新数据后会重新出发componentDidUpdate
      if (marker && marker.id !== this.selectedMarker.id) {
        // 如果有旧的选中点 将其还原
        if (this.selectedMarker.id) {
          this.selectedMarker.setContent(this.selectedMarker.defaultContent);
          this.selectedMarker.setOffset(this.markerDefaultOffset);
          this.selectedMarker.setzIndex(100);
        }
        // 将新的选中点保存 以备下次还原
        this.selectedMarker = marker;
        marker.setContent(marker.selectedContent);
        marker.setOffset(this.markerSelectedOffset);
        marker.setzIndex(101);
      }
      if (this._amap && this.cluster && this.shouldUpdateCluster) {
        // 更新点聚合
        const markers = Object.values(this.vehicleMarkers);
        this.cluster.setMarkers(markers);
        this.shouldUpdateCluster = false;
      }
    }
  }
  // 聚合函数
  renderCluserMarker = obj => {
    // 根据当前聚合的markers 判断渲染颜色
    const colors = getClusterColor(obj.markers);
    const contentBox = document.createElement("div");
    contentBox.setAttribute(
      "style",
      `width:40px;height:40px;border: 3px solid ${
        colors[1]
      };border-radius:50%;background:${
        colors[0]
      };color: white;display:flex;align-items:center;justify-content:center;font-size:17px;`
    );
    contentBox.innerHTML = obj.count;
    obj.marker.setContent(contentBox);
    obj.marker.setOffset(this.clusterMarkerOffset);
  };
  // 地图展示参数中的车辆
  renderVehicles = vehicles => {
    vehicles.forEach(v => {
      const oldVehicle = this.vehicleMarkers[v.id];
      if (!oldVehicle) {
        this.addVehicleMarker(v);
      }
    });
  };
  /**
   * 当地图移动或者缩放的时候
   */
  handleMoved = () => {
    const { onMapMoved } = this.props;
    if (onMapMoved) {
      const center = this._amap.getCenter();
      const bounds = this._amap.getBounds();
      const radius = center.distance(bounds.southwest);
      const zoom = this._amap.getZoom();

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
  moveto = (position, zoom) => {
    if (zoom) {
      this._amap.setZoom(zoom);
    }
    this._amap.setCenter(position);
  };

  renderMarker(type, status, selected, container) {
    const iconType = type === "vehicle" ? `bus-${status}` : "park";
    ReactDOM.render(
      <Iconfont type={iconType} selected={selected} />,
      container
    );
  }
  // 生成一个Marker的content
  getMarkerContent = (data, selected = false, hovered = false) => {
    const width = selected ? 42 : 25;
    const height = selected ? 54 : 25;
    // 外侧div
    const contentBox = document.createElement("div");
    contentBox.setAttribute(
      "style",
      `width:${width}px;height:${height}px;position:relative;`
    );
    // 文案 dom
    const label = document.createElement("div");
    label.setAttribute(
      "style",
      `position: absolute;left: 50%;top: -30px;background: black; color: white; padding: 2px 4px;width: max-content; border-radius: 3px;transform: translateX(-50%);`
    );
    label.innerText = data.title || "暂无数据";

    this.renderMarker(
      data.type.toLowerCase(),
      data.status.toLowerCase(),
      selected,
      contentBox
    );

    // hover 或者 选中时显示label
    if (selected || hovered) {
      contentBox.appendChild(label);
    }

    return contentBox;
  };
  // 创建一个车辆通用marker
  createMarker = data => {
    const marker = new AMap.Marker({
      position: data.position,
      offset: this.markerDefaultOffset,
      title: data.title,
    });
    marker.id = data.id;
    marker.status = data.status;
    // 将不同状态的MarkerContent存在Marker中方便切换
    marker.defaultContent = this.getMarkerContent(data, false, false);
    marker.selectedContent = this.getMarkerContent(data, true, false);
    marker.hoveredContent = this.getMarkerContent(data, false, true);
    marker.setContent(marker.defaultContent);
    marker.setOffset(this.markerDefaultOffset);
    marker.on("mouseover", () => {
      if (this.props.selectedVehicle.id !== marker.id) {
        marker.setContent(marker.hoveredContent);
      }
    });
    marker.on("mouseout", () => {
      if (this.props.selectedVehicle.id !== marker.id) {
        marker.setContent(marker.defaultContent);
      }
    });
    return marker;
  };
  // 创建一个停车场marker实例
  addParkMarker = data => {
    const marker = this.createMarker(data);
    this._amap.add(marker);
    // 暂时没有用 留着以后用
    this.parkMarkers.push(marker);
  };
  // 添加车辆Marker到地图
  addVehicleMarker = data => {
    const marker = this.createMarker(data);
    marker.on("click", e => {
      this.props.onSelectVehicle(data.id);
    });
    this._amap.add(marker);
    this.vehicleMarkers[data.id] = marker;
  };
  render() {
    return <div id="container" style={{ height: "100%", width: "100%" }} />;
  }
}
