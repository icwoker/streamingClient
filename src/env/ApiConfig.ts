//配置API基础URL
let apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
let wsBaseUrl = `ws://${window.location.hostname}:${window.location.port}`;

if (process.env.NODE_ENV === "development") {
  apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
  wsBaseUrl = `ws://${window.location.hostname}:5000`;
}

export { apiBaseUrl, wsBaseUrl };
