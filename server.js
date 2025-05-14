const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

const TARGET = "https://now.gg"; // 🔁 Troque aqui pelo site que quer acessar via proxy

app.use(
  "/xitanimes",
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    pathRewrite: { "^/xitanimes": "" },
    followRedirects: false,
    onProxyReq: (proxyReq, req) => {
      if (req.headers.cookie) {
        proxyReq.setHeader("cookie", req.headers.cookie);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      const location = proxyRes.headers["location"];
      if (location && location.startsWith(TARGET)) {
        const newLocation = location.replace(TARGET, "/xitanimes");
        proxyRes.headers["location"] = newLocation;
      }

      if (proxyRes.headers["set-cookie"]) {
        proxyRes.headers["set-cookie"] = proxyRes.headers["set-cookie"].map(cookie =>
          cookie.replace(/; Secure/gi, "").replace(/; SameSite=None/gi, "; SameSite=Lax")
        );
      }
    },
  })
);

app.get("/", (req, res) => {
  res.send("🛡️ Proxy para XitAnimes ativo! Acesse via <code>/xitanimes</code>");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
