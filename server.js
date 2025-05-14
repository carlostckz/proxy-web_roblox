const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

app.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://now.gg", // Altere para o destino desejado
    changeOrigin: true,
    pathRewrite: {
      "^/xitanimes": "",
    },
    followRedirects: false, // Não seguir redirecionamentos automaticamente
    selfHandleResponse: false, // Deixe que o proxy gerencie a resposta

    onProxyReq: (proxyReq, req, res) => {
      // Repassa os cookies da requisição original
      if (req.headers.cookie) {
        proxyReq.setHeader("cookie", req.headers.cookie);
      }
    },

    onProxyRes: (proxyRes, req, res) => {
      // Reescreve cabeçalho Location (evita sair do proxy)
      const location = proxyRes.headers["location"];
      if (location) {
        try {
          const targetUrl = new URL(location, "https://now.gg");
          const newLocation = "/xitanimes" + targetUrl.pathname + (targetUrl.search || "");
          proxyRes.headers["location"] = newLocation;
        } catch (e) {
          // Se falhar o parse, mantém original
          console.warn("Redirecionamento não foi reescrito:", location);
        }
      }

      // Permite que cookies passem para o navegador
      const cookies = proxyRes.headers["set-cookie"];
      if (cookies) {
        // Garante que os cookies funcionem sob o domínio atual
        proxyRes.headers["set-cookie"] = cookies.map(cookie =>
          cookie
            .replace(/; secure/gi, "") // Remove "secure" para aceitar HTTP (caso esteja em localhost)
            .replace(/; SameSite=None/gi, "; SameSite=Lax") // Ajusta SameSite
        );
      }
    },
  })
);

app.get("/", (req, res) => {
  res.send("🛡️ Proxy com cookies e redirecionamentos controlados! Acesse /xitanimes");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
