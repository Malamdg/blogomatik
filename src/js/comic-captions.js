      (() => {
        const site = document.getElementById("site");
        if (!site) return;
        function refresh() {
          site.querySelectorAll(".comic-grid .panel").forEach((panel, index) => {
            const caption = panel.querySelector(".panel-caption");
            if (!caption) return;
            panel.classList.toggle("caption-empty", !caption.textContent.trim());
            if (!panel.querySelector(".comic-caption-edit")) {
              const button = document.createElement("button");
              button.type = "button";
              button.className = "comic-caption-edit";
              button.textContent = "✏️ Modifier le texte";
              button.setAttribute("aria-label", "Modifier le texte de la case " + (index + 1));
              panel.appendChild(button);
            }
          });
        }
        site.addEventListener("click", (event) => {
          const button = event.target.closest(".comic-caption-edit");
          if (!button || !site.classList.contains("editing")) return;
          event.preventDefault();
          const caption = button.closest(".panel").querySelector(".panel-caption");
          const answer = prompt(
            "Texte de cette case (laisser vide pour agrandir l’image) :",
            caption.textContent,
          );
          if (answer === null) return;
          caption.textContent = answer;
          refresh();
        });
        site.addEventListener("input", (event) => {
          if (event.target.matches(".panel-caption")) refresh();
        });
        // Refresh after restoring saved content or resetting the template.
        const observer = new MutationObserver(() => refresh());
        observer.observe(site, { childList: true });
        refresh();
      })();
