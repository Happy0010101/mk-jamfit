(function () {
  const COLORS = {
    ivory: {
      name: "米白",
      en: "Ivory",
      hero: "images/ivory-1.jpg",
      alt: "米白色立领收腰外套，模特在廊下拿着咖啡",
      cap: "米白 · 廊下"
    },
    heather: {
      name: "深花灰",
      en: "Heather",
      hero: "images/heather-2.jpg",
      alt: "深花灰外套街头正面",
      cap: "深花灰 · 街头"
    },
    mocha: {
      name: "摩卡棕",
      en: "Mocha",
      hero: "images/mocha-2.jpg",
      alt: "摩卡棕外套站立正面，肩上挎着白色小包",
      cap: "摩卡棕 · 正面"
    }
  };

  const heroImg = document.getElementById("hero-img");
  const heroCap = document.getElementById("hero-cap");
  const studioImg = document.getElementById("studio-img");
  const studioCap = document.getElementById("studio-cap");
  const picks = Array.from(document.querySelectorAll("[data-color-pick]"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function swapImg(img, src, alt) {
    if (!img || img.getAttribute("src") === src) {
      if (alt) img.alt = alt;
      return;
    }
    const token = String(Date.now() + Math.random());
    img.dataset.token = token;
    const apply = () => {
      if (img.dataset.token !== token) return;
      img.src = src;
      if (alt) img.alt = alt;
      img.classList.remove("is-out");
    };
    if (reduce) {
      apply();
      return;
    }
    img.classList.add("is-out");
    window.setTimeout(apply, 400);
  }

  function applyColor(key) {
    const color = COLORS[key];
    if (!color) return;
    picks.forEach((btn) => {
      btn.setAttribute("aria-checked", String(btn.dataset.colorPick === key));
    });
    document.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.panel !== key;
    });
    document.querySelectorAll("[data-thumbs]").forEach((group) => {
      group.hidden = group.dataset.thumbs !== key;
    });
    swapImg(heroImg, color.hero, color.alt);
    heroCap.textContent = color.name + " · " + color.en;
    swapImg(studioImg, color.hero, color.alt);
    studioCap.textContent = color.cap;
    const group = document.querySelector('[data-thumbs="' + key + '"]');
    if (!group) return;
    group.querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.src === color.hero));
    });
  }

  picks.forEach((btn) => {
    btn.addEventListener("click", () => applyColor(btn.dataset.colorPick));
  });

  const swatchGroup = document.querySelector(".swatches");
  if (swatchGroup) {
    swatchGroup.addEventListener("keydown", (event) => {
      const order = ["ivory", "heather", "mocha"];
      const current = picks.find((btn) => btn.getAttribute("aria-checked") === "true");
      const index = order.indexOf(current ? current.dataset.colorPick : "ivory");
      let next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % order.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + order.length) % order.length;
      else return;
      event.preventDefault();
      applyColor(order[next]);
      const target = picks.find((btn) => btn.dataset.colorPick === order[next]);
      if (target) target.focus();
    });
  }

  document.querySelectorAll(".thumbs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.closest(".thumbs");
      group.querySelectorAll("button").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === btn));
      });
      swapImg(studioImg, btn.dataset.src, btn.dataset.alt);
      studioCap.textContent = btn.dataset.cap;
    });
  });

  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.getElementById("site-nav");
  const menuLabel = menuBtn.querySelector(".sr-only");

  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    menuLabel.textContent = open ? "关闭菜单" : "打开菜单";
    document.body.classList.toggle("no-scroll", open);
  }

  menuBtn.addEventListener("click", () => {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  const craftItems = Array.from(document.querySelectorAll(".craft-list li"));
  const craftImg = document.getElementById("craft-img");
  if ("IntersectionObserver" in window && craftImg) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          craftItems.forEach((item) => item.classList.toggle("is-active", item === entry.target));
          if (entry.target.dataset.img) {
            swapImg(craftImg, entry.target.dataset.img, entry.target.dataset.alt || "");
          }
        });
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: 0.1 }
    );
    craftItems.forEach((item) => observer.observe(item));
  }

  const weight = document.getElementById("weight");
  const result = document.getElementById("size-result");
  const sizeCells = Array.from(document.querySelectorAll("#size-table [data-size]"));

  function recommend(value) {
    const text = value.trim();
    sizeCells.forEach((cell) => cell.classList.remove("is-rec"));
    if (!text) {
      result.textContent = "输入体重，查看建议尺码。";
      return;
    }
    const n = Number(text);
    if (!Number.isFinite(n) || n <= 0) {
      result.textContent = "请输入体重，单位是斤。";
      return;
    }
    let sizes = [];
    if (n >= 90 && n <= 110) sizes.push("M");
    if (n >= 110 && n <= 130) sizes.push("L");
    if (n >= 130 && n <= 150) sizes.push("XL");
    let message;
    if (!sizes.length && n < 90) {
      sizes = ["M"];
      message = n + " 斤低于推荐区间，可优先试 M，以实物穿着为准。";
    } else if (!sizes.length) {
      sizes = ["XL"];
      message = n + " 斤高于推荐区间，可优先试 XL，以实物穿着为准。";
    } else if (sizes.length === 2) {
      message = n + " 斤落在 " + sizes[0] + " 与 " + sizes[1] + " 的交界。想要更贴身选 " + sizes[0] + "，想要更松量选 " + sizes[1] + "。";
    } else {
      message = n + " 斤，建议选 " + sizes[0] + "。";
    }
    sizeCells.forEach((cell) => {
      if (sizes.includes(cell.dataset.size)) cell.classList.add("is-rec");
    });
    result.textContent = message;
  }

  weight.addEventListener("input", () => recommend(weight.value));

  const filters = Array.from(document.querySelectorAll("[data-filter]"));
  const shots = Array.from(document.querySelectorAll(".looks-grid .shot"));
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filters.forEach((item) => item.setAttribute("aria-selected", String(item === btn)));
      shots.forEach((shot) => {
        shot.hidden = filter !== "all" && shot.dataset.color !== filter;
      });
    });
  });

  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbCap = document.getElementById("lb-cap");
  let lbIndex = 0;
  let lastFocus = null;

  function gallery() {
    return shots.filter((shot) => !shot.hidden).map((shot) => ({
      src: shot.dataset.full,
      cap: shot.dataset.cap,
      alt: shot.querySelector("img").alt
    }));
  }

  function showSlide(index) {
    const items = gallery();
    if (!items.length) return;
    lbIndex = (index + items.length) % items.length;
    const item = items[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCap.textContent = item.cap;
  }

  function openLightbox(src) {
    const items = gallery();
    const found = items.findIndex((item) => item.src === src);
    lastFocus = document.activeElement;
    lightbox.hidden = false;
    document.body.classList.add("no-scroll");
    showSlide(found < 0 ? 0 : found);
    lightbox.querySelector(".lb-close").focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  shots.forEach((shot) => {
    shot.addEventListener("click", () => openLightbox(shot.dataset.full));
  });

  studioImg.addEventListener("click", () => openLightbox(studioImg.getAttribute("src")));
  studioImg.style.cursor = "zoom-in";

  lightbox.querySelector(".lb-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lb-prev").addEventListener("click", () => showSlide(lbIndex - 1));
  lightbox.querySelector(".lb-next").addEventListener("click", () => showSlide(lbIndex + 1));

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showSlide(lbIndex - 1);
    if (event.key === "ArrowRight") showSlide(lbIndex + 1);
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
})();
