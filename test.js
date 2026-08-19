fetch("https://api-inference.huggingface.co/status")
  .then(r => r.text())
  .then(console.log)
  .catch(err => console.error("Erreur réseau:", err.message));
