(function () {
  "use strict";

  /* ---------- Ano no rodapé ---------- */
  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header + barra de progresso ao rolar ---------- */
  var header = document.getElementById("siteHeader");
  var progress = document.getElementById("scrollProgress");
  var backToTop = document.getElementById("backToTop");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (backToTop) backToTop.classList.toggle("is-visible", y > 600);

    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var ratio = max > 0 ? y / max : 0;
      progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, ratio)) + ")";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal ao rolar ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Contadores animados ---------- */
  function formatCount(value, format) {
    if (format === "k" && value >= 1000) {
      return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1).replace(".", ",") + "mil";
    }
    return Math.round(value).toString();
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count") || "0");
    var suffix = el.getAttribute("data-suffix") || "";
    var format = el.getAttribute("data-format") || "";
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progressRatio = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - progressRatio, 3);
      var current = target * eased;
      el.textContent = formatCount(current, format) + suffix;
      if (progressRatio < 1) requestAnimationFrame(step);
      else el.textContent = formatCount(target, format) + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll(".counter");
  if (counters.length && "IntersectionObserver" in window) {
    var counterIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterIO.observe(el); });
  }

  /* ---------- Alternância de planos mensal / anual ---------- */
  var planToggle = document.querySelectorAll(".toggle-option");
  var planAmounts = document.querySelectorAll(".plan-price .amount");
  planToggle.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cycle = btn.getAttribute("data-cycle");
      planToggle.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      planAmounts.forEach(function (amount) {
        var value = amount.getAttribute(cycle === "annual" ? "data-annual" : "data-monthly");
        amount.style.opacity = "0";
        setTimeout(function () {
          amount.textContent = value;
          amount.style.opacity = "1";
        }, 120);
      });
      document.querySelectorAll(".plan-price .period").forEach(function (period) {
        period.textContent = cycle === "annual" ? "/mês no anual" : "/mês";
      });
    });
  });

  /* ---------- Carrossel de depoimentos ---------- */
  var track = document.getElementById("testimonialTrack");
  var dotsWrap = document.getElementById("tDots");
  var prevBtn = document.getElementById("tPrev");
  var nextBtn = document.getElementById("tNext");

  if (track && dotsWrap) {
    var slides = track.querySelectorAll(".t-card");
    var current = 0;
    var autoplayTimer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "t-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Ir para depoimento " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll(".t-dot");

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === current); });
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(function () { goTo(current + 1); }, 6000);
    }
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); startAutoplay(); });

    var carousel = document.getElementById("testimonialCarousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", stopAutoplay);
      carousel.addEventListener("mouseleave", startAutoplay);
    }

    goTo(0);
    startAutoplay();
  }

  /* ---------- FAQ (acordeão) ---------- */
  document.querySelectorAll(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-question").forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
      });
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------- Cartões de seguro / plano -> preenchem o formulário ---------- */
  function fillQuoteType(value) {
    var select = document.getElementById("qType");
    var form = document.getElementById("quoteForm");
    if (select) {
      var found = Array.prototype.some.call(select.options, function (opt) {
        if (opt.value === value) { select.value = value; return true; }
        return false;
      });
      if (!found && value) {
        var opt = document.createElement("option");
        opt.value = value; opt.textContent = value;
        select.appendChild(opt);
        select.value = value;
      }
    }
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      var name = document.getElementById("qName");
      if (name) setTimeout(function () { name.focus(); }, 500);
    }
  }

  document.querySelectorAll("[data-quote]").forEach(function (el) {
    el.addEventListener("click", function () {
      fillQuoteType(el.getAttribute("data-quote"));
    });
  });

  /* ---------- Formulário de cotação ---------- */
  var form = document.getElementById("quoteForm");
  var formNote = document.getElementById("formNote");
  var WHATSAPP_NUMBER = "5500000000000";

  function setFieldError(fieldId, hasError) {
    var input = document.getElementById(fieldId);
    if (!input) return;
    var wrap = input.closest(".field");
    if (wrap) wrap.classList.toggle("has-error", hasError);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("qName").value.trim();
      var phone = document.getElementById("qPhone").value.trim();
      var type = document.getElementById("qType").value;
      var message = document.getElementById("qMessage").value.trim();

      var nameValid = name.length >= 3;
      var phoneValid = phone.replace(/\D/g, "").length >= 10;
      var typeValid = !!type;

      setFieldError("qName", !nameValid);
      setFieldError("qPhone", !phoneValid);
      setFieldError("qType", !typeValid);

      if (!nameValid || !phoneValid || !typeValid) {
        if (formNote) {
          formNote.textContent = "Confira os campos destacados antes de continuar.";
          formNote.className = "form-note error";
        }
        return;
      }

      var text = "Olá! Meu nome é " + name + ".\n" +
        "Tenho interesse em: " + type + ".\n" +
        "Meu WhatsApp: " + phone + "." +
        (message ? "\nMensagem: " + message : "");

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);

      if (formNote) {
        formNote.textContent = "Tudo certo! Abrindo o WhatsApp para continuar sua cotação...";
        formNote.className = "form-note success";
      }

      window.open(url, "_blank", "noopener");
      form.reset();
    });

    ["qName", "qPhone", "qType"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", function () { setFieldError(id, false); });
    });
  }
})();
