const { createProxyMiddleware } = require("http-proxy-middleware");

const targetUrl = "http://backend:8080";

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/api",
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${targetUrl}${proxyReq.path}`);
      },
    })
  );
};
