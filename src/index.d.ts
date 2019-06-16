import * as React from "react";
import { ArrayLngLat } from "react-amap";

declare class BusMap extends React.Component<BusMapProps, any> {}

export type VEHICLE_STATE =
  | "STOP"
  | "CHARGING"
  | "RUNNING"
  | "REPAIRING"
  | "ALARM-3"
  | "ALARM-2"
  | "ALARM-1";

export interface Vehicle {
  position: ArrayLngLat;
  title: string;
  offset?: ArrayLngLat;
  state?: VEHICLE_STATE;
  id: string;
}

export interface Park {
  position: ArrayLngLat;
  title: string;
  offset?: ArrayLngLat;
  id: string;
}

export interface onMapMoveEvent {
  center: ArrayLngLat;
  radius: number;
  zoom: number;
}

export interface BusMapProps {
  className?: string;
  center?: ArrayLngLat; // 地图的起始center
  mapStyle?: string; // 地图样式
  onMapMoved?(event: onMapMoveEvent): void; // 当用户拖动地图时触发,
  onSelectVehicle?(vehicleId: string): void; // 当用户点击marker时触发, 改变selectedVehicleId
  parks: [Park]; // 停车场的数据信息
  selectedVehicleId: string; // 用户选择的车辆
  setIconFont?(icon: string, selected: boolean, data: object): void; // 设置地区icon,
  vehicles: [Vehicle]; // 车辆的数据信息
  zoom: number; // 地图的起始zoom
}

export default BusMap;
