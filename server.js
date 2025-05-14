const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

// Proxy dinâmico com reescrita de links
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.send("⚠️ Use /proxy?url=http://google.com");
  }

  try {
    const response = await fetch(target);
    let body = await response.text();

    const baseUrl = new URL(target);

    // Reescreve todos os hrefs para continuar passando pelo proxy
    body = body.replace(/href="(.*?)"/g, (match, href) => {
      if (href.startsWith("http")) {
        return `href="/proxy?url=${href}"`;
      } else if (href.startsWith("/")) {
        return `href="/proxy?url=${baseUrl.origin}${href}"`;
      } else {
        return `href="/proxy?url=${baseUrl.origin}/${href}"`;
      }
    });

    // Reescreve formulários
    body = body.replace(/action="(.*?)"/g, (match, action) => {
      if (action.startsWith("http")) {
        return `action="/proxy?url=${action}"`;
      } else if (action.startsWith("/")) {
        return `action="/proxy?url=${baseUrl.origin}${action}"`;
      } else {
        return `action="/proxy?url=${baseUrl.origin}/${action}"`;
      }
    });

    res.send(body);
  } catch (err) {
    res.status(500).send("Erro ao buscar o site: " + err.message);
  }
});

// Página inicial
app.get("/", (req, res) => {
  res.send("🛡️ Proxy com reescrita funcionando! Acesse /proxy?url=http://google.com");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
