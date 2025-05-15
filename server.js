const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

const TARGET = "https://now.gg"; // 🔁 Alvo do proxy

// ✅ Middleware para permitir CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Pode ajustar para domínios específicos
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// ✅ Proxy configurado
app.use(
  "/xitanimes",
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    followRedirects: false,
    pathRewrite: (path, req) => path.replace(/^\/xitanimes/, ""),
    onProxyReq: (proxyReq, req) => {
      if (req.headers.cookie) {
        proxyReq.setHeader("cookie", req.headers.cookie);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Corrige redirecionamentos
      const location = proxyRes.headers["location"];
      if (location && location.startsWith(TARGET)) {
        proxyRes.headers["location"] = location.replace(TARGET, "/xitanimes");
      }

      // Corrige cookies que causam bloqueios
      if (proxyRes.headers["set-cookie"]) {
        proxyRes.headers["set-cookie"] = proxyRes.headers["set-cookie"].map(cookie =>
          cookie
            .replace(/; Secure/gi, "")
            .replace(/; SameSite=None/gi, "; SameSite=Lax")
        );
      }

      // Detecta e corrige Content-Type de imagens (opcional)
      const contentType = proxyRes.headers["content-type"];
      if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg
