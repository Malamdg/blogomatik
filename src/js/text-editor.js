      (() => {
        const site = document.getElementById("site");
        // Include decorative text and links, including content restored from older exports.
        const textSelectors =
          ".editable,.stamp,.section-label,.panel-number,.placeholder,.precepts .n,.cover .fallback,.stock-mask,.book [data-link]";
        function refresh() {
          const enabled = site.classList.contains("editing") ? "true" : "false";
          site.querySelectorAll(textSelectors).forEach((element) => {
            if (!element.classList.contains("editable")) element.classList.add("editable");
            if (element.getAttribute("contenteditable") !== enabled)
              element.setAttribute("contenteditable", enabled);
          });
        }
        // Editing cover text must not open the image picker; editing link text must not navigate.
        site.addEventListener(
          "click",
          (event) => {
            if (!site.classList.contains("editing")) return;
            const editable = event.target.closest(".editable");
            if (editable?.closest(".cover") || editable?.matches("a")) {
              if (editable.matches("a")) event.preventDefault();
              event.stopPropagation();
              editable.focus();
            }
          },
          true,
        );
        const observer = new MutationObserver(refresh);
        observer.observe(site, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class"],
        });
        refresh();
      })();
