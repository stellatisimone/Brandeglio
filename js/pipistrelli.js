/* Pipistrelli decorativi.
   1. Volo d'ingresso: aggiunge .is-in a ogni gruppo quando entra nello schermo (l'animazione è in style.css).
   2. Con il mouse: se il cursore passa vicino a un pipistrello, questo sbatte le ali, si allontana un po' e poi torna.
   Senza JavaScript, o con "Riduci movimento", i pipistrelli restano semplicemente al loro posto. */
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var groups = document.querySelectorAll(".bats");
  if (!groups.length) return;
  document.documentElement.classList.add("bats-js");

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -15% 0px" });
  groups.forEach(function (g) { io.observe(g); });

  // Con il mouse (non su touch): se il cursore passa vicino, il pipistrello si sposta e poi torna.
  // Lo spostamento usa i margini, che funzionano in tutti i browser e non interferiscono con le animazioni CSS.
  var RADIUS = 130;   // px: quanto vicino deve passare il cursore
  var FLEE = 70;      // px: quanto si allontana
  var state = new WeakMap();

  function flee(bat, mx, my) {
    var st = state.get(bat);
    if (!st) { st = { dx: 0, dy: 0, busy: false }; state.set(bat, st); }
    if (st.busy) return;
    var r = bat.getBoundingClientRect();
    if (!r.width) return;                       // nascosto (display: none)
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var vx = cx - mx, vy = cy - my, d = Math.sqrt(vx * vx + vy * vy);
    if (d > RADIUS) return;
    if (d < 1) { vx = 0; vy = -1; d = 1; }
    st.busy = true;
    var dx = Math.round(vx / d * FLEE), dy = Math.round(vy / d * FLEE - 20); // un po' verso l'alto
    bat.style.transition = "margin 0.5s cubic-bezier(0.2, 0.8, 0.3, 1)";
    bat.style.marginLeft = dx + "px";
    bat.style.marginTop = dy + "px";
    if (bat.animate) {
      try { bat.animate([{ scale: "1 1" }, { scale: "1 0.45" }], { duration: 110, iterations: 6, direction: "alternate" }); } catch (err) {}
    }
    setTimeout(function () {
      bat.style.transition = "margin 1.8s ease-in-out";
      bat.style.marginLeft = "0px";
      bat.style.marginTop = "0px";
      setTimeout(function () { st.busy = false; }, 1800);
    }, 1300);
  }

  groups.forEach(function (g) {
    var section = g.parentNode, bats = g.querySelectorAll(".bat"), frame = 0, mx = 0, my = 0;
    function onMove(e) {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      mx = e.clientX; my = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        for (var i = 0; i < bats.length; i++) flee(bats[i], mx, my);
      });
    }
    section.addEventListener(window.PointerEvent ? "pointermove" : "mousemove", onMove, { passive: true });
  });
})();
