/**
 * 停车场数据结构
 *
 * {
 *   "name": "逸仙路停车场",
 *   "address": "逸仙路205号",
 *   "location": {
 *       "lng": "121.48935",
 *       "lat": "31.2976"
 *   }
 * }
 **/
export const transParks = (parks = []) => {
  return parks.map(data => ({
    position: [data.location.lng, data.location.lat],
    title: data.name,
    offset: [-14, -14],
    topWhenClick: true,
    id: `park-${data.name}`,
    type: "park",
  }));
};

/**
 * 车辆数据结构
 *
 * {
 *   "company": "巴士一公司",
 *   "id": "LSFD13201GC001639",
 *   "line": "966",
 *   "location": {
 *       "lng": 121.53773799999999,
 *       "lat": 31.320247
 *   },
 *   repairing：true,
 *   state: "ONLINE",
 *   "overall": {
 *       "status": "ON",
 *       "chargStatus": "UNCHARGED"
 *   },
 *   "no": "JZ-P0712",
 *   "alarms": ["code", "code", "code"]
 *   "alarmLevel": 1
 * }
 */
// position: { longitude: data.location.lng, latitude: data.location.lat },

export const transVehicles = (vehicles = []) => {
  return vehicles.filter(v => v.location).map(transVehicle);
};

export const transVehicle = data => ({
  position: [data.location.lng, data.location.lat],
  title: data.no,
  offset: [-14, -14],
  topWhenClick: true,
  state: data.state,
  id: data.id,
  type: "vehicle",
});
