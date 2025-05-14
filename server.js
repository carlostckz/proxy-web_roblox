const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.send("⚠️ Passe uma URL via ?url=https://google.com");

  try {
    const response = await fetch(target);
    let body = await response.text();

    // Reescreve links básicos para manter dentro do proxy
    body = body.replace(/href="(.*?)"/g, (match, href) => {
      if (href.startsWith("http")) {
        return `href="/proxy?url=${href}"`;
      } else if (href.startsWith("/")) {
        const baseUrl = new URL(target);
        return `href="/proxy?url=${baseUrl.origin}${href}"`;
      } else {
        return match;
      }
    });

    res.send(body);
  } catch (err) {
    res.status(500).send("Erro ao buscar o site: " + err.message);
  }
});

app.get("/", (req, res) => {
  res.send("🛡️ Proxy com reescrita parcial. Use /proxy?url=https://google.com");
});

app.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
});
