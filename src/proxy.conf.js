const HttpsProxyAgent = require("https-proxy-agent");

const proxyConfig = [
  {
    context: "/api",
    pathRewrite: { "^/api": "" },
    target: "https://woocommerce-1248616-4474056.cloudwaysapps.com",
    changeOrigin: true,
    secure: false,
  },
];

function setupForCorporateProxy(proxyConfig) {
  const proxyServer = process.env.http_proxy || process.env.HTTP_PROXY;

  if (proxyServer) {
    const agent = new HttpsProxyAgent(proxyServer);
    proxyConfig.forEach((c) => {
      c.agent = agent;
    });
  }
  return proxyConfig;
}

module.exports = setupForCorporateProxy(proxyConfig);
