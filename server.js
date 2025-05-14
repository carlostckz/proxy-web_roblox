const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://now.gg/apps/19901", // troque por qualquer site (ex: https://wikipedia.org)
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "",
    },
  })
);

app.get("/", (req, res) => {
  res.send("🛡️ roblox está funcionando! Acesse /proxy para usar.");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
