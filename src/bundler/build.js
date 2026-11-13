const { readFile, mkdir, writeFile } = require("node:fs/promises");
const { watch } = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const root = path.resolve(__dirname, "../..");

async function build() {
  const [template, styles, javascript] = await Promise.all([
    readFile(path.join(root, "src/html/index.html"), "utf8"),
    readFile(path.join(root, "src/css/styles.css"), "utf8"),
    esbuild.build({
      entryPoints: [path.join(root, "src/js/app.js")],
      bundle: true,
      write: false,
      format: "iife",
      target: "es2020",
      charset: "utf8",
      legalComments: "inline",
    }),
  ]);

  function replaceMarker(html, marker, content) {
    if (html.split(marker).length !== 2) {
      throw new Error(`Le modèle doit contenir exactement une fois ${marker}.`);
    }
    return html.replace(marker, () => content);
  }

  if (/<\/style/i.test(styles) || /<\/script/i.test(javascript.outputFiles[0].text)) {
    throw new Error("Le contenu intégré contient une balise de fermeture HTML inattendue.");
  }
  let html = replaceMarker(template, "<!-- BLOG_STYLES -->", styles);
  html = replaceMarker(html, "<!-- BLOG_SCRIPT -->", javascript.outputFiles[0].text);
  await mkdir(path.join(root, "out"), { recursive: true });
  await writeFile(path.join(root, "out/index.html"), html);
  console.log("Fichier généré : out/index.html");
}

async function main() {
  await build();
  if (!process.argv.includes("--watch")) return;

  let timer;
  let running = false;
  let pending = false;
  async function rebuild() {
    if (running) {
      pending = true;
      return;
    }
    running = true;
    try {
      await build();
    } catch (error) {
      console.error(error);
    } finally {
      running = false;
      if (pending) {
        pending = false;
        await rebuild();
      }
    }
  }
  for (const directory of ["html", "css", "js"]) {
    watch(path.join(root, "src", directory), () => {
      clearTimeout(timer);
      timer = setTimeout(rebuild, 100);
    });
  }
  console.log("Surveillance des sources activée (Ctrl+C pour arrêter).");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
