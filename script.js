/* Remont.Kz - лэндинг. Ванильный JS: плиты, сигнатура нивелира, меню, якоря, лента, форма. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, W = window;
  root.classList.add("js");

  var REDUCED = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };

  /* ---------- WhatsApp: текст собирается в момент клика (фаза захвата на window - совместимо с LeadBot) ---------- */
  var WA_NUM = "77713203757";
  var WA = {
    "default": "Здравствуйте! Пишу с сайта Remont.Kz. Нужна консультация по ремонту.",
    hero: "Здравствуйте! Нужен расчёт ремонта квартиры в Астане. Площадь и адрес: ",
    kvartiry: "Здравствуйте! Нужен ремонт квартиры под ключ. Площадь, район и состояние квартиры: ",
    novostroyka: "Здравствуйте! Нужен ремонт квартиры в новостройке. ЖК, площадь и состояние от застройщика: ",
    kommerc: "Здравствуйте! Нужен ремонт коммерческого помещения. Тип помещения, площадь и желаемый срок открытия: ",
    standart: "Здравствуйте! Интересует пакет STANDART (от 45 000 тг/м2). Площадь и адрес квартиры: ",
    comfort: "Здравствуйте! Интересует пакет COMFORT (от 55 000 тг/м2). Площадь и адрес квартиры: ",
    premium: "Здравствуйте! Интересует пакет PREMIUM (от 85 000 тг/м2). Площадь и адрес квартиры: ",
    zamer: "Здравствуйте! Хочу вызвать мастера на бесплатный замер. Адрес и удобное время: ",
    kontakty: "Здравствуйте! Пишу с сайта Remont.Kz. Хочу обсудить ремонт. Объект: "
  };
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-wa]") : null;
    if (!a) return;
    var key = a.getAttribute("data-wa") || "default";
    var text = WA[key] || WA["default"];
    a.setAttribute("href", "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(text));
  }, true);

  /* ---------- fitText для заголовка героя ---------- */
  var h1 = doc.getElementById("h1");
  function fitText() {
    if (!h1) return;
    var l1 = h1.querySelector(".l1");
    var avail = h1.clientWidth;
    if (!avail || !l1) return;
    var fs = Math.min(Math.max(44, Math.min(W.innerWidth * 0.13, W.innerHeight * 0.105)), 132);
    h1.style.setProperty("--fs", fs + "px");
    var guard = 0;
    while (guard++ < 30 && l1.scrollWidth > avail + 1 && fs > 22) {
      fs *= 0.95; h1.style.setProperty("--fs", fs + "px");
    }
  }

  /* ---------- Меню ---------- */
  var burger = doc.querySelector(".burger"), menu = doc.getElementById("menu");
  var behind = [doc.getElementById("main"), doc.querySelector(".foot"), doc.getElementById("sticky")];
  function setMenu(open, returnFocus) {
    if (!menu || !burger) return;
    var was = doc.body.classList.contains("menu-open");
    doc.body.classList.toggle("menu-open", open);
    behind.forEach(function (el) { if (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); } });
    if (open && !was) setTimeout(function () { var first = menu.querySelector("a"); if (first) first.focus({ preventScroll: true }); }, 40);
    if (!open && was && returnFocus) burger.focus({ preventScroll: true });
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add("open"); }); }
    else { menu.classList.remove("open"); setTimeout(function () { if (!doc.body.classList.contains("menu-open")) menu.hidden = true; }, 320); }
  }
  if (burger) burger.addEventListener("click", function () { var o = doc.body.classList.contains("menu-open"); setMenu(!o, o); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.body.classList.contains("menu-open")) setMenu(false, true); });

  /* ---------- Якоря ---------- */
  var HDR = function () { return parseFloat(getComputedStyle(root).getPropertyValue("--hdr")) || 68; };
  function targetTop(el) {
    var r = el.getBoundingClientRect().top + W.pageYOffset;
    if (el.classList.contains("pw")) return r;
    if (el.classList.contains("sec")) return r - HDR();
    return r - HDR() - 14;
  }
  function goTo(id, instant) {
    var el = doc.getElementById(id);
    if (!el) return false;
    setMenu(false);
    var top = Math.max(0, targetTop(el));
    if (instant || REDUCED) { root.style.scrollBehavior = "auto"; W.scrollTo(0, top); root.style.scrollBehavior = ""; }
    else W.scrollTo({ top: top, behavior: "smooth" });
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (goTo(id)) {
      e.preventDefault();
      try { history.pushState(null, "", "#" + id); } catch (err) {}
      var t = doc.getElementById(id);
      if (t) { if (!t.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) t.setAttribute("tabindex", "-1"); try { t.focus({ preventScroll: true }); } catch (err2) {} }
    }
  });

  /* ---------- Плиты и сигнатура нивелира ---------- */
  var pws = [].slice.call(doc.querySelectorAll(".pw"));
  var firstSec = doc.querySelector("main > .sec");
  var sticky = doc.getElementById("sticky"), zay = doc.getElementById("zayavka");
  var INTRO = (location.hash.length > 1 || W.pageYOffset > 80 || REDUCED) ? 1 : 0;
  var introStart = 0;
  var ticking = false;

  function update() {
    ticking = false;
    var H = W.innerHeight;
    /* сначала все замеры, потом запись переменных - без чередования чтения и записи (layout thrash) */
    var rects = pws.map(function (el) { return el.getBoundingClientRect(); });
    var secTop = firstSec ? firstSec.getBoundingClientRect().top : null;
    var zayTop = zay ? zay.getBoundingClientRect().top : null;
    var pageY = W.pageYOffset;
    for (var i = 0; i < pws.length; i++) {
      var pw = pws[i], r = rects[i];
      var enter = clamp(1 - r.top / H);
      var stay = r.height > H ? clamp(-r.top / (r.height - H)) : 0;
      var nxtTop = i + 1 < pws.length ? rects[i + 1].top : secTop;
      var exit = nxtTop !== null ? clamp(1 - nxtTop / H) : 0;
      var isHero = pw.classList.contains("pw-hero");
      /* крест нивелира: --ld - линии прочерчиваются, --open - кадр раскрывается крестом от линий */
      /* у плиты центр кадра показывается из-за нижней кромки экрана только при enter > .5, поэтому крест рисуется с .42 */
      var p = isHero ? INTRO : enter;
      var ld = REDUCED ? 1 : (isHero ? clamp(p / 0.3) : clamp((p - 0.42) / 0.2));
      var o = isHero ? clamp((p - 0.25) / 0.7) : clamp((p - 0.55) / 0.42);
      var open = REDUCED ? 1 : o * o * (3 - 2 * o);
      pw.style.setProperty("--enter", enter.toFixed(4));
      pw.style.setProperty("--stay", stay.toFixed(4));
      pw.style.setProperty("--exit", exit.toFixed(4));
      pw.style.setProperty("--ld", ld.toFixed(4));
      pw.style.setProperty("--open", open.toFixed(4));
      if (isHero) pw.style.setProperty("--intro", easeOut(INTRO).toFixed(4));
      var plate = pw.firstElementChild;
      if (plate) plate.classList.toggle("gone", exit >= 1);
      var txts = pw.querySelectorAll(".txt");
      for (var k = 0; k < txts.length; k++) txts[k].classList.toggle("on", isHero ? INTRO > 0.42 : enter > 0.72);
    }
    if (sticky) {
      var show = pageY > H * 0.55;
      if (zayTop !== null && zayTop < H * 0.6) show = false;
      sticky.classList.toggle("show", show);
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  W.addEventListener("scroll", onScroll, { passive: true });
  W.addEventListener("resize", function () { fitText(); onScroll(); updateRails(); });
  function runIntro(ts) {
    if (!introStart) introStart = ts;
    INTRO = clamp((ts - introStart) / 1250);
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }

  /* ---------- Лента этапов со стрелками ---------- */
  var rails = [].slice.call(doc.querySelectorAll(".rail"));
  function railStep(rail) {
    var card = rail.firstElementChild; if (!card) return 300;
    var cs = getComputedStyle(rail);
    var gap = parseFloat(cs.columnGap || cs.gap) || 16;
    return card.getBoundingClientRect().width + gap;
  }
  function updateRail(rail) {
    var btns = doc.querySelectorAll('.arr[data-for="' + rail.id + '"]');
    var max = rail.scrollWidth - rail.clientWidth;
    var none = max <= 1;
    [].forEach.call(btns, function (b) {
      b.hidden = none;
      var dir = +b.getAttribute("data-dir");
      b.disabled = dir < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= max - 2;
    });
  }
  function updateRails() { rails.forEach(updateRail); }
  rails.forEach(function (rail) {
    rail.addEventListener("scroll", function () { updateRail(rail); }, { passive: true });
    rail.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); rail.scrollBy({ left: railStep(rail), behavior: REDUCED ? "auto" : "smooth" }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); rail.scrollBy({ left: -railStep(rail), behavior: REDUCED ? "auto" : "smooth" }); }
    });
    updateRail(rail);
  });
  [].forEach.call(doc.querySelectorAll(".arr[data-for]"), function (b) {
    b.addEventListener("click", function () {
      var rail = doc.getElementById(b.getAttribute("data-for")); if (!rail) return;
      rail.scrollBy({ left: railStep(rail) * (+b.getAttribute("data-dir")), behavior: REDUCED ? "auto" : "smooth" });
    });
  });

  /* ---------- Проявление секций ---------- */
  var rv = [].slice.call(doc.querySelectorAll(".rv"));
  if ("IntersectionObserver" in W && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < W.innerHeight) el.classList.add("in"); }); }, 1500);
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Форма -> WhatsApp ---------- */
  var form = doc.getElementById("form"), thanks = doc.getElementById("thanks"), ferr = doc.getElementById("ferr");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      if (f.website && f.website.value) { form.hidden = true; if (thanks) thanks.hidden = false; return; }
      var name = f.name.value.trim(), phone = f.phone.value.trim();
      var badName = !name, badPhone = phone.replace(/\D/g, "").length < 10;
      f.name.classList.toggle("bad", badName); f.phone.classList.toggle("bad", badPhone);
      f.name.setAttribute("aria-invalid", badName ? "true" : "false"); f.phone.setAttribute("aria-invalid", badPhone ? "true" : "false");
      if (badName || badPhone) { if (ferr) ferr.hidden = false; (badName ? f.name : f.phone).focus(); return; }
      if (ferr) ferr.hidden = true;
      var lines = ["Заявка с сайта Remont.Kz", "Имя: " + name, "Телефон: " + phone, "Объект: " + f.object.value];
      if (f.message.value.trim()) lines.push("Сообщение: " + f.message.value.trim());
      var url = "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(lines.join("\n"));
      W.open(url, "_blank", "noopener");
      form.hidden = true; if (thanks) { thanks.hidden = false; try { thanks.focus({ preventScroll: true }); } catch (err) {} }
    });
  }

  var year = doc.getElementById("year"); if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Старт ---------- */
  function start() {
    fitText();
    if (location.hash.length > 1) {
      var id = location.hash.slice(1);
      goTo(id, true);
      setTimeout(function () { goTo(id, true); update(); }, 60);
      setTimeout(function () { goTo(id, true); update(); }, 500);
    }
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
    updateRails();
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitText(); update(); });
  if (doc.readyState === "complete") start(); else W.addEventListener("load", start);
  update();
})();
