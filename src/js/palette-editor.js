      (() => {
        const site = document.getElementById("site");
        const target = document.getElementById("paletteTarget");
        const text = document.getElementById("paletteText"),
          background = document.getElementById("paletteBackground");
        // Entries map visible controls to inherited variables carried by the site clone.
        const groups = [
          ["body", "Texte général", "text", "#202020", null],
          ["header", "En-tête : texte secondaire", "header-text", "#202020", null],
          ["title", "Titre principal", "title-text", "#202020", null],
          ["heading", "Titres de section", "heading-text", "#202020", null],
          ["label", "Bandeaux des rubriques", "label-text", "#ffffff", "label-bg", "#202020"],
          ["stamp", "Badge de l’en-tête", "stamp-text", "#202020", "stamp-bg", "#ff9fa6"],
          ["number", "Numéros des cases", "number-text", "#202020", "number-bg", "#ffda52"],
          [
            "bullet",
            "Numéros des points de l’article",
            "bullet-text",
            "#202020",
            "bullet-bg",
            "#ff9fa6",
          ],
          ["panel", "Cases 1 et 4 : fond", null, null, "panel-bg", "#ffffff"],
          ["panel2", "Cases 2 et 5 : fond", null, null, "panel2-bg", "#fff1ce"],
          ["panel3", "Cases 3 et 6 : fond", null, null, "panel3-bg", "#dff1ee"],
          ["caption", "Légendes des cases", "caption-text", "#202020", "caption-bg", "#ffffff"],
          ["selection", "Présentation de la sélection", "selection-text", "#202020", null],
          [
            "cover",
            "Couvertures : texte et fond impair",
            "cover-text",
            "#202020",
            "cover-bg",
            "#fff7d4",
          ],
          ["cover2", "Couvertures : fond pair", null, null, "cover2-bg", "#d8e9e7"],
          ["spine", "Livre couché", "spine-text", "#202020", "spine-bg", "#fff7d4"],
          [
            "coming",
            "Emplacement « Plus à venir »",
            "coming-text",
            "#202020",
            "coming-bg",
            "#fff9ee",
          ],
          ["stock", "Mentions de stock", "stock-text", "#ffffff", "stock-bg", "#141414"],
          ["book-title", "Titres des livres", "book-title-text", "#202020", null],
          ["link", "Liens des livres", "link-text", "#202020", null],
          ["footer", "Pied de page", "footer-text", "#202020", "footer-bg", "#fffaf0"],
          ["divider", "Séparateurs des points de l’article", null, null, "divider", "#bdb8aa"],
        ];
        const allowed = new Set([
          "border",
          "shadow",
          ...groups.flatMap((g) => [g[2], g[4]]).filter(Boolean),
        ]);
        const storageKey = "blog-configurator:palette:" + location.pathname;
        const valid = (value) => /^#[0-9a-f]{6}$/i.test(value);
        function value(key, fallback) {
          return site.style.getPropertyValue("--theme-" + key).trim() || fallback;
        }
        function save() {
          const colors = {};
          allowed.forEach((key) => {
            const color = value(key, "");
            if (valid(color)) colors[key] = color;
          });
          try {
            localStorage.setItem(storageKey, JSON.stringify(colors));
          } catch (e) {}
        }
        // Restore changes for this file; an export also carries its own inline palette.
        try {
          const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
          Object.entries(saved).forEach(([key, color]) => {
            if (allowed.has(key) && valid(color)) site.style.setProperty("--theme-" + key, color);
          });
        } catch (e) {}
        target.replaceChildren();
        groups.forEach((group) => target.add(new Option(group[1], group[0])));
        function refresh() {
          const group = groups.find((g) => g[0] === target.value);
          text.disabled = !group[2];
          background.disabled = !group[4];
          text.value = group[2] ? value(group[2], group[3]) : "#202020";
          background.value = group[4] ? value(group[4], group[5]) : "#ffffff";
          document.getElementById("paletteBorder").value = value("border", "#202020");
          document.getElementById("paletteShadow").value = value("shadow", "#242424");
        }
        target.addEventListener("change", refresh);
        [
          [text, 2],
          [background, 4],
        ].forEach(([input, index]) =>
          input.addEventListener("input", () => {
            const key = groups.find((g) => g[0] === target.value)[index];
            if (key) {
              site.style.setProperty("--theme-" + key, input.value);
              save();
            }
          }),
        );
        [
          ["paletteBorder", "border"],
          ["paletteShadow", "shadow"],
        ].forEach(([id, key]) =>
          document.getElementById(id).addEventListener("input", (event) => {
            site.style.setProperty("--theme-" + key, event.target.value);
            save();
          }),
        );
        document.getElementById("saveBtn").addEventListener("click", save);
        const reset = document.getElementById("resetBtn"),
          originalReset = reset.onclick;
        reset.onclick = () => {
          const previous = site.firstElementChild;
          originalReset();
          if (previous !== site.firstElementChild) {
            allowed.forEach((key) => site.style.removeProperty("--theme-" + key));
            try {
              localStorage.removeItem(storageKey);
            } catch (e) {}
            refresh();
          }
        };
        refresh();
      })();
