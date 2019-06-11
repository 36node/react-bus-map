/**
 * init dotenv
 *
 * .env: Default.
 * .env.local: Local overrides. This file is loaded for all environments except test.
 * .env.development, .env.test, .env.production: Environment-specific settings.
 * .env.development.local, .env.test.local, .env.production.local: Local overrides of environment-specific settings.
 *
 * Available settings
 *
 * APP_PORT=9527
 * APP_BASE_PATH=/v1
 * APP_JWT_PUBLIC_KEY=`a public key string`
 */

/**
 *
 * @param {string} name envrionment name
 * @param {object} opt option with { required, default }
 * @returns {*} value
 */

export function env(name, init) {
  const key = `REACT_APP_${name.toUpperCase()}`;
  const value = process.env[key] || init;

  if (value === undefined) {
    throw new Error(`environment ${name} is missing`);
  }

  // eslint-disable-line
  console.log("build time", key, value);

  return value;
}

export function runtimeEnv(name, init) {
  const key = `REACT_APP_${name.toUpperCase()}`;
  const runtimeValue = window && window._36node && window._36node[key];

  const buildtimeValue = env(name, init);

  const value = runtimeValue || buildtimeValue;

  // eslint-disable-line
  console.log("run time", key, value);

  return value;
}

/**
 * APP
 */
export const RUNTIME_CONFIG = {
  get STORE_BASE() {
    return runtimeEnv("STORE_BASE", "");
  },
  get CORE_BASE() {
    return runtimeEnv("CORE_BASE", "");
  },
  get LOG_BASE() {
    return runtimeEnv("LOG_BASE", "");
  },
  get LOG_WS() {
    return runtimeEnv("LOG_WS", "https://api.36node.com/shanghaibus/log/v0/ws");
  },
  get CHART_BASE() {
    return runtimeEnv("CHART_BASE", "/chart");
  },
  get AUTH_BASE() {
    return runtimeEnv("AUTH_BASE", "https://stargate.36node.com/api/auth/v0");
  },
  get AUTH_PROVIDER() {
    return runtimeEnv("AUTH_PROVIDER", "5cb9a4edc48ad400120d28a7");
  },
  get SAFE_BASE() {
    return runtimeEnv("SAFE_BASE", "https://busev.shanghaibus.36node.com/api");
  },
};
export const TOKEN = env(
  "TOKEN",
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VyIjp7InJvbGVzIjpbIkFETUlOIiwiVVNFUiJdfX0.XA1kE_UdbOsU0rfmG3g1y3SpJ5aFVzPGFBHihVXv58sNatweqLHPEUAwhqobgKgmAbaKa3dlYrXEpHESHZ7AJgQYCfSeVxtsKyoQmcq9OYA0iFcH5oCWQgYqfeWJPOroMlMdNQax5kG-GkuaFbIiwiw-9j_ACS8CSPO9Oq2dQCA"
);
export const AMAP_KEY = env("AMAP_KEY", "76bc843ad59ac45ccd1e20b2a79f4694");
export const VERSION = env("VERSION", "0.0.0");
export const GO_LIVE_DATE = env("GO_LIVE_DATE", "2019-02-01");

export const VEHICLE_TOTAL = env("VEHICLE_TOTAL", 3679);

// base document title
export const BASE_TITLE = env("BASE_TITLE", "新能源车辆监控平台");

/**
 * 地图加载全部车辆 定时 默认60s
 */
export const MAP_LIST_ALL_VEHICLES_INTERVAL = env(
  "MAP_LIST_ALL_VEHICLES_INTERVAL",
  60000
);

/**
 * 地图加载局部车辆定时 默认10s
 */
export const MAP_LIST_LOCAL_VEHICLES_INTERVAL = env(
  "MAP_LIST_LOCAL_VEHICLES_INTERVAL",
  10000
);

/**
 * 统计数据获取定时，默认为100s
 */
export const STATISTIC_GET_INTERVAL = env("STATISTIC_GET_INTERVAL", 100000);

/**
 * 选中车辆数据获取定时，默认为10s
 */
export const SELECTED_VEHICLE_GET_INTERVAL = env(
  "SELECTED_VEHICLE_GET_INTERVAL",
  10000
);

/**
 *  漕宝路大屏api刷新频率，默认10分钟
 */
export const SCREEN_API_FETCH_INTERVAL = env(
  "SCREEN_API_FETCH_INTERVAL",
  600000
);
