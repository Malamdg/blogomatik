      (() => {
        const storageKey = (name) => "blog-configurator:" + name + ":" + location.pathname;
        function readSetting(name) {
          try {
            return localStorage.getItem(storageKey(name));
          } catch (error) {
            return null;
          }
        }
        function readColors() {
          try {
            const colors = JSON.parse(readSetting("colors"));
            return colors && typeof colors === "object" && !Array.isArray(colors) ? colors : null;
          } catch (error) {
            return null;
          }
        }
        const site = document.getElementById("site"),
          editBtn = document.getElementById("editBtn"),
          saveBtn = document.getElementById("saveBtn"),
          imageInput = document.getElementById("imageInput");
        let editing = false,
          target = null;
        const initial = site.innerHTML;
        const embedded = window.__BLOG_CONFIG__ || null;
        const fontSelect = document.getElementById("fontSelect");
        const fonts = {
          dm: "'DM Sans',Arial,sans-serif",
          comic: "'Comic Sans MS','Comic Sans',cursive",
          marker: "'Permanent Marker','Comic Sans MS',cursive",
          arial: "Arial,Helvetica,sans-serif",
          georgia: "Georgia,serif",
          verdana: "Verdana,Geneva,sans-serif",
          courier: "'Courier New',monospace",
        };
        function applyFont(key) {
          const chosen = fonts[key] ? key : "dm";
          document.documentElement.style.setProperty("--global-font", fonts[chosen]);
          fontSelect.value = chosen;
          try {
            localStorage.setItem(storageKey("font"), chosen);
          } catch (e) {}
        }
        fontSelect.addEventListener("change", () => applyFont(fontSelect.value));
        applyFont(readSetting("font") || embedded?.font || "dm");
        function toast(t) {
          const e = document.getElementById("toast");
          e.textContent = t;
          e.style.display = "block";
          setTimeout(() => (e.style.display = "none"), 2500);
        }
        function mode(on) {
          editing = on;
          site.classList.toggle("editing", on);
          site
            .querySelectorAll(".editable")
            .forEach((e) => (e.contentEditable = on ? "true" : "false"));
          editBtn.textContent = on ? "✓ Terminer l’édition" : "✏️ Activer l’édition";
          saveBtn.textContent = "💾 Enregistrer";
        }
        editBtn.onclick = () => mode(!editing);
        function snapshot() {
          const clone = site.cloneNode(true);
          clone.classList.remove("editing");
          clone
            .querySelectorAll("[contenteditable]")
            .forEach((e) => e.removeAttribute("contenteditable"));
          return clone.innerHTML;
        }
        function store() {
          try {
            localStorage.setItem(storageKey("content"), snapshot());
            toast("Modifications enregistrées dans ce navigateur.");
          } catch (e) {
            toast(
              "Enregistrement local impossible. Exportez le HTML pour conserver vos modifications.",
            );
          }
        }
        function exportHTML() {
          const clone = document.documentElement.cloneNode(true);
          const copySite = clone.querySelector("#site");
          copySite.innerHTML = snapshot();
          copySite.classList.remove("editing");
          clone.querySelector("#fontSelect").value = fontSelect.value;
          const config = {
            content: snapshot(),
            font: fontSelect.value,
            header: document.getElementById("headerColor").value,
            band: document.getElementById("bandColor").value,
            paper: document.getElementById("paperColor").value,
            size: document.getElementById("textSize").value,
          };
          clone.querySelectorAll("script[data-blog-config]").forEach((script) => script.remove());
          const boot = clone.ownerDocument.createElement("script");
          boot.dataset.blogConfig = "";
          boot.textContent =
            "window.__BLOG_CONFIG__=" + JSON.stringify(config).replace(/</g, "\\u003c") + ";";
          clone.querySelector("head").appendChild(boot);
          clone.querySelectorAll(".editable").forEach((e) => e.removeAttribute("contenteditable"));
          const html = "<!DOCTYPE html>\n" + clone.outerHTML;
          const blob = new Blob([html], { type: "text/html;charset=utf-8" }),
            url = URL.createObjectURL(blob),
            a = document.createElement("a");
          a.href = url;
          a.download = "mon-blog.html";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          toast("Fichier HTML exporté.");
        }
        document.getElementById("pdfBtn").onclick = () => {
          if (document.activeElement?.blur) document.activeElement.blur();
          const sizes = {
            A1: [594, 841],
            A2: [420, 594],
            A3: [297, 420],
            A4: [210, 297],
            A5: [148, 210],
          };
          const format = document.getElementById("pdfFormat").value;
          const [pw, ph] = sizes[format] || sizes.A4;
          const copy = site.cloneNode(true);
          copy.classList.remove("editing");
          copy
            .querySelectorAll("[contenteditable]")
            .forEach((el) => el.removeAttribute("contenteditable"));
          copy
            .querySelectorAll(
              ".book-tools,.edit-art,.add-book,.stock-editor,.note,.comic-caption-edit",
            )
            .forEach((el) => el.remove());
          // Keep the visual theme, but isolate paper layout from legacy print and mobile rules.
          const css = [...document.querySelectorAll("style")]
            .flatMap((el) => [...el.sheet.cssRules])
            .filter((rule) => rule.type !== CSSRule.MEDIA_RULE && rule.type !== CSSRule.PAGE_RULE)
            .map((rule) => rule.cssText)
            .join("\n");
          const printCSS = `
  @page{size:${pw}mm ${ph}mm;margin:0}
  html,body{margin:0!important;padding:0!important;background:white!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .sheet{width:${pw}mm;height:${ph}mm;position:relative;overflow:hidden;background:white;break-after:avoid;page-break-after:avoid}
  .sheet .wrap{position:absolute!important;left:0;top:0;width:1000px;max-width:none!important;margin:0!important;padding:0 9px 9px 0!important;transform-origin:top left!important;box-sizing:border-box!important}
  .sheet .site{width:100%!important;border:3px solid #202020!important;box-shadow:9px 9px 0 #242424!important;overflow:visible!important}
  .sheet .content{display:grid!important;grid-template-columns:minmax(0,1.18fr) minmax(0,.82fr)!important}
  .sheet .comic-section{border-right:3px solid #202020!important;border-bottom:0!important}
  .sheet .comic-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
  .sheet .books{grid-template-columns:repeat(4,minmax(0,1fr))!important}
  .sheet .panel{border:3px solid #202020!important;box-shadow:3px 3px 0 #202020!important}
  .sheet .cover{box-shadow:5px 5px 0 #202020}
  .sheet .toolbar,.sheet .config-bar,.sheet .edit-art,.sheet .book-tools,.sheet .add-book,.sheet .note,.sheet .comic-caption-edit,.sheet .stock-editor{display:none!important}
  .sheet .editable{outline:none!important}
  .sheet .masthead{padding:20px 24px!important}
  .sheet .masthead h1{font-size:2.625em!important;margin:8px 100px 9px 0!important}
  .sheet .masthead p{max-width:calc(100% - 100px)}
  .sheet .stamp{position:absolute;right:22px;top:24px;width:76px;height:76px;font-size:12px;margin:0}
  .sheet h2{font-size:1.5em;margin:14px 0 16px}
  .sheet .comic-section,.sheet .post-section{padding:18px!important;min-width:0}
  .sheet .comic-section{display:flex;flex-direction:column}
  .sheet .comic-section>.section-label{align-self:flex-start}
  .sheet .comic-grid{flex:1;grid-template-rows:repeat(2,minmax(180px,1fr));gap:12px}
  .sheet .panel{min-height:180px!important}
  .sheet .panel-art{height:0;min-height:110px;flex:1 1 0}
  .sheet .panel-art img{position:absolute;inset:0}
  .sheet .panel-caption{flex:0 0 auto;font-size:.85em!important;padding:9px}
  .sheet .comic-grid .panel.caption-empty .panel-art{min-height:180px}
  .sheet .placeholder{font-size:56px}
  .sheet .post-intro{font-size:.95em;line-height:1.45;margin-bottom:12px}
  .sheet .precepts li{padding:6px 0;grid-template-columns:34px 1fr;gap:8px}
  .sheet .precepts .n{width:30px;height:30px;font-size:.85em}
  .sheet .precepts strong{font-size:.9em}
  .sheet .precepts p{font-size:.85em;line-height:1.4}
  .sheet .selection{padding:18px 24px 20px}
  .sheet .selection h2{margin:12px 0 4px}
  .sheet .selection p{margin-bottom:16px}
  .sheet .books{grid-template-columns:1fr 1fr 1.333333fr 1fr!important;gap:16px;align-items:start}
  .sheet .books>.book.spine-book .cover{aspect-ratio:1;box-shadow:none!important}
  .sheet .cover .fallback{font-size:20px}
  .sheet .coming-soon .cover .fallback{font-size:52px}
  .sheet .stock-mask{font-size:.85em}
  .sheet .footer{padding:10px 24px}
  .sheet .site{font-size:var(--base-size,100%)!important}
  @media print{.sheet{width:${pw}mm!important;height:${ph}mm!important}}
  `;
          const cfg = getComputedStyle(site);
          const font =
            cfg.getPropertyValue("--global-font") || getComputedStyle(document.body).fontFamily;
          const size = cfg.getPropertyValue("--base-size") || "100%";
          const js = `
  function fit(){
    const sheet=document.querySelector('.sheet'),wrap=sheet.querySelector('.wrap');
    wrap.style.transform='none';
    const rect=sheet.getBoundingClientRect();
    const margin=4*96/25.4;
    const availableW=rect.width-2*margin,availableH=rect.height-2*margin;
    // Find a layout with the paper's useful aspect ratio before scaling it.
    // Fixed typography and no viewport queries keep measurements stable in print.
    let low=720,high=2400;
    for(let i=0;i<18;i++){
      const width=(low+high)/2;
      wrap.style.width=width+'px';
      if(wrap.getBoundingClientRect().height/width>availableH/availableW)low=width;
      else high=width;
    }
    wrap.style.width=high+'px';
    const bounds=wrap.getBoundingClientRect(),w=bounds.width,h=bounds.height;
    const scale=Math.min(availableW/w,availableH/h);
    wrap.style.transform='scale('+scale+')';
    wrap.style.left=(margin+(availableW-w*scale)/2)+'px';
    wrap.style.top=(margin+(availableH-h*scale)/2)+'px';
    window.__printFit={scale:scale,sheetW:sheet.clientWidth,sheetH:sheet.clientHeight,contentW:w*scale,contentH:h*scale,left:parseFloat(wrap.style.left),top:parseFloat(wrap.style.top)};
  }
  window.addEventListener('load',async()=>{
    try{await document.fonts.ready}catch(e){}
    await Promise.all([...document.images].map(im=>im.complete?Promise.resolve():new Promise(resolve=>{im.onload=resolve;im.onerror=resolve})));
    fit();window.__printReady=true;
    setTimeout(()=>window.print(),500);
  });
  window.addEventListener('beforeprint',fit);
  `;
          const html =
            '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Blog — ' +
            format +
            " portrait</title><style>" +
            css +
            "\n:root{--global-font:" +
            font +
            ";--base-size:" +
            size +
            "}" +
            printCSS +
            '</style></head><body><div class="sheet"><div class="wrap">' +
            copy.outerHTML +
            "</div></div><scr" +
            "ipt>" +
            js +
            "</scr" +
            "ipt></body></html>";
          const win = window.open("", "_blank");
          if (!win) {
            toast("Autorise les fenêtres pop-up pour exporter en PDF.");
            return;
          }
          win.document.open();
          win.document.write(html);
          win.document.close();
          toast("Aperçu ouvert : choisis « Enregistrer au format PDF ».");
        };
        saveBtn.onclick = store;
        document.getElementById("exportBtn").onclick = exportHTML;
        document.getElementById("resetBtn").onclick = () => {
          if (!confirm("Remettre la maquette initiale ?")) return;
          try {
            ["content", "font", "colors"].forEach((name) =>
              localStorage.removeItem(storageKey(name)),
            );
          } catch (error) {}
          applyFont("dm");
          site.innerHTML = initial;
          ensureComingSoonLast();
          applyColors({ header: "#ffda52", band: "#f9cbd0", paper: "#fffaf0", size: 100 });
          mode(true);
          toast("Maquette réinitialisée.");
        };
        try {
          const saved = readSetting("content");
          if (saved) site.innerHTML = saved;
          else if (embedded?.content) site.innerHTML = embedded.content;
        } catch (e) {}
        mode(true);
        function applyColors(c) {
          const fields = {
            header: "headerColor",
            band: "bandColor",
            paper: "paperColor",
            size: "textSize",
          };
          for (const [k, id] of Object.entries(fields)) {
            if (c[k] !== undefined) document.getElementById(id).value = c[k];
          }
          site.querySelector(".masthead").style.background =
            document.getElementById("headerColor").value;
          site.querySelector(".selection").style.background =
            document.getElementById("bandColor").value;
          site.style.background = document.getElementById("paperColor").value;
          site.style.setProperty("--base-size", document.getElementById("textSize").value + "%");
          document.getElementById("sizeOutput").textContent =
            document.getElementById("textSize").value + " %";
        }
        const colors = readColors() || embedded || {};
        applyColors(colors);
        ["headerColor", "bandColor", "paperColor", "textSize"].forEach((id) =>
          document.getElementById(id).addEventListener("input", () => {
            applyColors({});
            try {
              localStorage.setItem(
                storageKey("colors"),
                JSON.stringify({
                  header: document.getElementById("headerColor").value,
                  band: document.getElementById("bandColor").value,
                  paper: document.getElementById("paperColor").value,
                  size: document.getElementById("textSize").value,
                }),
              );
            } catch (e) {}
          }),
        );
        function ensureComingSoonLast() {
          const books = document.getElementById("books");
          const coming = books?.querySelector(".coming-soon");
          if (coming && coming !== books.lastElementChild) books.append(coming);
        }
        ensureComingSoonLast();
        site.addEventListener("click", (e) => {
          if (!editing) return;
          const change = e.target.closest(".edit-art,.upload-cover");
          if (change) {
            target =
              change.closest(".panel-art") || change.closest(".book")?.querySelector(".cover");
            if (!target) {
              toast("Emplacement image introuvable.");
              return;
            }
            imageInput.value = "";
            imageInput.click();
            return;
          }
          const stockToggle = e.target.closest(".toggle-stock");
          if (stockToggle) {
            const mask = stockToggle.closest(".book").querySelector(".stock-mask");
            if (mask) {
              mask.hidden = !mask.hidden;
              toast(mask.hidden ? "Masque retiré" : "Masque rupture affiché");
            }
            return;
          }
          const stockEdit = e.target.closest(".edit-stock");
          if (stockEdit) {
            const book = stockEdit.closest(".book"),
              mask = book.querySelector(".stock-mask"),
              field = book.querySelector(".stock-editor");
            if (mask && field) {
              field.value = mask.textContent;
              field.classList.toggle("open");
              if (field.classList.contains("open")) {
                field.focus();
                field.select();
              }
            }
            return;
          }
          const coverClick = e.target.closest(".cover");
          if (coverClick && !coverClick.closest(".coming-soon")) {
            target = coverClick;
            imageInput.click();
            return;
          }
          const link = e.target.closest(".edit-link");
          if (link) {
            const a = link.closest(".book").querySelector("[data-link]"),
              v = prompt(
                "URL du livre (https://...)",
                a.getAttribute("href") === "#" ? "" : a.getAttribute("href"),
              );
            if (v !== null) {
              if (v.trim() && !/^https?:\/\//i.test(v.trim()))
                return alert("Utilise un lien commençant par https:// ou http://");
              a.href = v.trim() || "#";
              a.textContent = v.trim() ? "Voir le livre ↗" : "Lien vers le livre";
            }
            return;
          }
          const remove = e.target.closest(".remove-book");
          if (remove) {
            e.preventDefault();
            e.stopPropagation();
            const book = remove.closest(".book");
            if (book && !book.classList.contains("coming-soon")) {
              book.remove();
              ensureComingSoonLast();
              toast("Livre retiré.");
            }
            return;
          }
        });
        site.addEventListener("input", (e) => {
          if (e.target.matches(".stock-editor")) {
            const mask = e.target.closest(".book").querySelector(".stock-mask");
            if (mask) {
              mask.textContent = e.target.value || "RUPTURE DE STOCK";
              mask.hidden = false;
            }
          }
        });
        imageInput.onchange = () => {
          const file = imageInput.files[0];
          if (!file || !target) return;
          if (!file.type.startsWith("image/")) {
            alert("Choisis une image (JPG, PNG, WebP ou GIF).");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            target.querySelectorAll("img,.placeholder,.fallback").forEach((e) => e.remove());
            const img = document.createElement("img");
            img.src = reader.result;
            img.alt = "Illustration personnalisée";
            target.prepend(img);
            toast("Image ajoutée !");
            imageInput.value = "";
          };
          reader.onerror = () => toast("Impossible de lire cette image.");
          reader.readAsDataURL(file);
        };
        document.getElementById("addBook").onclick = () => {
          if (!editing) return;
          const b = document.createElement("div");
          b.className = "book";
          b.innerHTML =
            '<div class="cover"><span class="fallback editable" contenteditable="true">NOUVELLE<br>LECTURE</span><span class="stock-mask" hidden>RUPTURE DE STOCK</span></div><h3 class="editable" contenteditable="true">Titre du livre</h3><a href="#" data-link>Lien vers le livre</a><div class="book-tools"><button class="mini upload-cover" type="button">📷 Image</button><button class="mini edit-link" type="button">🔗 Lien</button><button class="mini toggle-stock" type="button">🚫 Rupture : ON/OFF</button><button class="mini edit-stock" type="button">✍️ Modifier le texte de rupture</button><input class="stock-editor" type="text" aria-label="Texte de rupture de stock" placeholder="Ex. ÉPUISÉ"><button class="mini remove-book" type="button">✕ Retirer</button></div>';
          const books = document.getElementById("books");
          const coming = books.querySelector(".coming-soon");
          if (coming) books.insertBefore(b, coming);
          else books.append(b);
          ensureComingSoonLast();
          toast("Livre ajouté avant « Plus à venir ».");
        };
        document.addEventListener("click", (e) => {
          const a = e.target.closest("a[data-link]");
          if (a && a.getAttribute("href") === "#") e.preventDefault();
        });
      })();
