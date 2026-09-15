(function () {
  if (typeof window.ScrollReveal === "function") return;

  function asElements(target) {
    if (typeof target === "string") return Array.from(document.querySelectorAll(target));
    if (target instanceof Element) return [target];
    if (target instanceof NodeList || Array.isArray(target)) return Array.from(target);
    return [];
  }

  function merge(base, extra) {
    return Object.assign({}, base, extra || {});
  }

  function initialTransform(options) {
    var distance = options.distance || "0px";
    var axis = options.origin === "left" || options.origin === "right" ? "X" : "Y";
    var sign = options.origin === "top" || options.origin === "left" ? "-" : "";
    var scale = options.scale && options.scale !== 1 ? " scale(" + options.scale + ")" : "";
    return "translate" + axis + "(" + sign + distance + ")" + scale;
  }

  window.ScrollReveal = function (defaults) {
    var base = merge(
      {
        cleanup: true,
        delay: 0,
        distance: "20px",
        duration: 900,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        interval: 0,
        opacity: 0,
        origin: "bottom",
        reset: false,
        scale: 1,
        viewFactor: 0.12,
        viewOffset: { bottom: 0 },
        afterReveal: function () {},
      },
      defaults
    );
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function reveal(target, options) {
      var config = merge(base, options);
      var elements = asElements(target);
      var threshold = Math.max(0, Math.min(1, config.viewFactor || 0));
      var bottomOffset = config.viewOffset && config.viewOffset.bottom ? config.viewOffset.bottom : 0;

      if (reducedMotion.matches) {
        elements.forEach(function (element) {
          element.classList.add("is-visible");
          config.afterReveal(element);
        });
        return api;
      }

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var element = entry.target;
            var index = Number(element.getAttribute("data-sr-index") || 0);
            var delay = (config.delay || 0) + index * (config.interval || 0);

            element.style.transition =
              "opacity " +
              config.duration +
              "ms " +
              config.easing +
              " " +
              delay +
              "ms, transform " +
              config.duration +
              "ms " +
              config.easing +
              " " +
              delay +
              "ms, filter " +
              config.duration +
              "ms " +
              config.easing +
              " " +
              delay +
              "ms";
            element.style.visibility = "visible";
            element.style.opacity = "1";
            element.style.filter = "blur(0)";
            element.style.transform = "translate3d(0, 0, 0) scale(1)";

            window.setTimeout(function () {
              element.classList.add("is-visible");
              config.afterReveal(element);
              if (config.cleanup) {
                element.removeAttribute("style");
                element.removeAttribute("data-sr-index");
              }
            }, config.duration + delay + 60);

            if (!config.reset) observer.unobserve(element);
          });
        },
        { rootMargin: "0px 0px -" + bottomOffset + "px 0px", threshold: threshold }
      );

      elements.forEach(function (element, index) {
        if (element.classList.contains("is-visible")) return;
        element.setAttribute("data-sr-index", index);
        element.style.visibility = "hidden";
        element.style.opacity = String(config.opacity);
        element.style.filter = "blur(5px)";
        element.style.transform = initialTransform(config);
        observer.observe(element);
      });

      return api;
    }

    var api = {
      clean: function () {},
      destroy: function () {},
      reveal: reveal,
      sync: function () {},
      version: "local-scrollreveal-effect",
    };

    return api;
  };
})();
