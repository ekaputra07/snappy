(() => {
  // js/widget.js
  (function() {
    const style = document.createElement("style");
    style.id = "jetform-style";
    style.innerHTML = `
      .jf-iframe-wrapper {
        align-items: center;
        background: rgba(0,0,0,.0);
        cursor: pointer;
        display:flex;
        justify-content: center;
        left:0;
        position: fixed;
        top:0;
        transition: background .3s linear;
        z-index: 99998;
      }
      .jf-iframe-wrapper.loaded,
      .jf-iframe-wrapper.loading {
        background: rgba(0,0,0,0.6);
        height: 100%;
        width: 100%;
      }
      .jf-iframe-wrapper.embed {
        background: transparent;
        cursor: initial;
        display: block;
        height: 573px;
        margin: 0 auto;
        max-width: 1024px;
        position: initial;
      }
      .jf-iframe-wrapper.embed.loading {
        height: 50px;
        width: 100px;
      }
      .jf-iframe-wrapper.loading:before {
        align-items: center;
        color: #fff;
        content: 'Loading...';
        display: flex;
        justify-content: center;
        padding: 10px 50px;
      }
      .jf-iframe-wrapper.embed.loading:before {
        display: none;
      }
      .jf-iframe-wrapper.loaded .jf-iframe {
        height: 100%;
        width: 100%;
      }
      .jf-iframe {
        z-index:2;
        border:none;
        width:0;
        height:0;
      }
    `;
    document.head.appendChild(style);
  })();
  window.JetformWidget = {
    init: function() {
      let script = document.getElementById("jetform-widget-js");
      if (script === null) {
        alert("Script widget JetForm tidak dipasang dengan benar!");
      }
      let scriptOrigin = new URL(script.getAttribute("src")).origin;
      let referrer = encodeURIComponent(window.location.href);
      document.querySelectorAll(".jf-iframe-wrapper").forEach((el) => {
        el.remove();
      });
      let jetformLinks = document.querySelectorAll("a.jetform-button");
      jetformLinks = Array.from(jetformLinks);
      jetformLinks.forEach((jetformLink) => {
        const productLink = jetformLink.getAttribute("href");
        const url = new URL(productLink);
        const displayStyle = jetformLink.getAttribute("data-display-style");
        const iframeWrapper = this.createIframeWrapper(displayStyle);
        const iframeToBeLoaded = this.createIframe(
          jetformLink,
          iframeWrapper
        );
        if (displayStyle === "embed") {
          iframeWrapper.classList.add("loading", "embed");
          let query = url.searchParams.size == 0 ? `?referrer=${referrer}&mode=embed` : `&referrer=${referrer}&mode=embed`;
          iframeToBeLoaded.setAttribute("src", `${productLink}${query}`);
        } else {
          jetformLink.addEventListener("click", (event) => {
            event.preventDefault();
            let query = url.searchParams.size == 0 ? `?referrer=${referrer}&mode=popup` : `&referrer=${referrer}&mode=popup`;
            iframeWrapper.classList.add("loading");
            iframeToBeLoaded.setAttribute("src", `${productLink}${query}`);
          });
        }
      });
      window.addEventListener("message", function(e) {
        if (e.origin !== scriptOrigin)
          return;
        if (e.data.action === "jf:closepopup") {
          document.querySelectorAll(".jf-iframe-wrapper").forEach((el) => {
            el.classList.remove("loaded");
          });
        } else if (e.data.action === "jf:openurl" && e.data.url) {
          window.open(e.data.url, "_top");
        }
      }, false);
    },
    createIframeWrapper: (displayStyle) => {
      const iframeWrapper = document.createElement("div");
      iframeWrapper.classList.add("jf-iframe-wrapper");
      document.body.appendChild(iframeWrapper);
      if (displayStyle !== "embed") {
        iframeWrapper.addEventListener("click", (event) => {
          iframeWrapper.classList.remove("loaded");
        });
      }
      return iframeWrapper;
    },
    createIframe: (jetformLink, iframeWrapper) => {
      const jetformIframe = document.createElement("iframe");
      jetformIframe.setAttribute("data-src", jetformLink);
      jetformIframe.classList.add("jf-iframe");
      jetformIframe.addEventListener("load", () => {
        const iframeSrc = jetformIframe.getAttribute("src");
        if (iframeSrc) {
          iframeWrapper.classList.remove("loading");
          iframeWrapper.classList.add("loaded");
        }
        const displayStyle = jetformLink.getAttribute("data-display-style");
        if (displayStyle === "embed") {
          jetformLink.style.display = "none";
        }
      });
      iframeWrapper.appendChild(jetformIframe);
      return jetformIframe;
    }
  };
  (function() {
    window.JetformWidget.init();
  })();
})();