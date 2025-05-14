const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://google.com", // substitua pelo site desejado
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "",
    },
    onProxyRes: (proxyRes, req, res) => {
      // Reescreve o cabeçalho Location para manter no proxy
      const location = proxyRes.headers['location'];
      if (location) {
        const targetHost = new URL("https://google.com"); // mesmo que o "target"
        const newLocation = location.replace(targetHost.origin, "/proxy");
        proxyRes.headers['location'] = newLocation;
      }
    },
    followRedirects: false // evita seguir automaticamente redirecionamentos
  })
);

app.get("/", (req, res) => {
  res.send("🛡️ Proxy funcionando! Acesse /proxy para usar.");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
