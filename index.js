import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const HF_KEY = process.env.HF_KEY;

// --- ROUTE PROXY POUR HUGGINGFACE ---
app.post("/generate", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res.json({ error: "no prompt" });
  }

  const modelName = model || "prompthero/openjourney-v4";
  const apiUrl = `https://api-inference.huggingface.co/models/${modelName}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.json({
        error: "HuggingFace API error",
        code: response.status,
        details: errorText
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString("base64");

    return res.json({
      model: modelName,
      image_base64: base64
    });

  } catch (err) {
    return res.json({
      error: "fetch failed",
      details: err.message
    });
  }
});

// --- ROUTE TEST ---
app.get("/", (req, res) => {
  res.send("Proxy HuggingFace OK ??");
});

// --- GESTION AUTOMATIQUE DU PORT ---
const PORT = process.env.PORT || 3000;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`API running on port ${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`?? Port ${port} déjà utilisé, tentative sur ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("Erreur serveur :", err);
    }
  });
}

startServer(PORT);
