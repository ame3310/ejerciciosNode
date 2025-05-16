const http = require("http");
const fs = require("fs").promises;
const path = require("path");
const open = require("open");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const BASE_URL = `http://localhost:${PORT}`;

const ROUTES = {
  "/": "home.html",
  "/about": "about.html",
  "/location": "location.html",
  "/services": "services.html",
  "/contact": "contact.html",
};

const fileCache = new Map();

async function loadFile(filePath) {
  if (fileCache.has(filePath)) {
    return fileCache.get(filePath);
  }

  try {
    const content = await fs.readFile(filePath, "utf8");
    fileCache.set(filePath, content);
    return content;
  } catch (err) {
    throw err;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const filePath = path.join(
      PUBLIC_DIR,
      ROUTES[req.url] || `${req.url}.html`
    );

    let content;
    try {
      content = await loadFile(filePath);
      res.writeHead(200, {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=3600",
      });
    } catch (err) {
      if (err.code === "ENOENT") {
        content = await loadFile(path.join(PUBLIC_DIR, "404.html"));
        res.writeHead(404, { "Content-Type": "text/html" });
      } else {
        throw err;
      }
    }

    res.end(content);
  } catch (err) {
    console.error("Error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Error interno del servidor");
  }
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en ${BASE_URL}`);

  open(BASE_URL)
    .then(() => console.log("Navegador abierto automáticamente"))
    .catch((err) => console.error("No se pudo abrir el navegador:", err));
});
