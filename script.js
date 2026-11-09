/* ============================================================
   作品集 · 交互脚本
   - 拼贴拖拽（data-rotate 初始旋转）+ hover 抬升
   - 弹层开关（入口卡片 / 遮罩 / 关闭按钮 / ESC）
   - 弹层打开时技能条动画
   - 平滑滚动 + 导航高亮
   ============================================================ */

(function () {
  "use strict";

  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ---------- 1. 拼贴项：初始旋转 + 拖拽 ---------- */
  function initCollageDrag() {
    const items = $$(".collage-item");

    items.forEach((el) => {
      const rot = parseFloat(el.dataset.rotate || 0);
      el.style.transform = `rotate(${rot}deg)`;

      let isDragging = false;
      let startX = 0, startY = 0;
      let origX = 0, origY = 0;
      let curRotate = rot;

      const onStart = (e) => {
        isDragging = true;
        el.style.zIndex = "40";
        el.style.transition = "none";

        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;

        const matrix = new DOMMatrix(getComputedStyle(el).transform);
        origX = matrix.m41;
        origY = matrix.m42;
        curRotate = Math.atan2(matrix.m12, matrix.m11) * (180 / Math.PI);

        e.preventDefault();
      };

      const onMove = (e) => {
        if (!isDragging) return;
        const point = e.touches ? e.touches[0] : e;
        const dx = point.clientX - startX;
        const dy = point.clientY - startY;
        el.style.transform = `translate(${origX + dx}px, ${origY + dy}px) rotate(${curRotate}deg)`;
        e.preventDefault();
      };

      const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        el.style.zIndex = "";
        el.style.transition = "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease";
      };

      el.addEventListener("mousedown", onStart);
      el.addEventListener("touchstart", onStart, { passive: false });
      document.addEventListener("mousemove", onMove);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchend", onEnd);
    });
  }

  /* ---------- 2. 弹层 ---------- */
  function initModals() {
    const triggers = $$("[data-modal]");
    const modals = $$(".modal");

    const openModal = (id) => {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      // 若是技能弹层，触发技能条动画
      if (id === "skillsModal") {
        requestAnimationFrame(() => {
          $$("#skillsModal .skill-fill").forEach((f) => {
            f.style.width = f.dataset.width + "%";
          });
        });
      }
    };

    const closeModal = (modal) => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      // 重置技能条
      $$("#skillsModal .skill-fill").forEach((f) => (f.style.width = "0"));
    };

    // 点击入口卡片打开
    triggers.forEach((t) => {
      t.addEventListener("click", () => openModal(t.dataset.modal));
    });

    // 点击遮罩 / 关闭按钮
    modals.forEach((modal) => {
      modal.querySelectorAll("[data-close]").forEach((btn) => {
        btn.addEventListener("click", () => closeModal(modal));
      });
    });

    // ESC 关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const open = document.querySelector(".modal.open");
        if (open) closeModal(open);
      }
    });
  }

  /* ---------- 3. 平滑滚动 ---------- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 56;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  }

  /* ---------- 4. 导航高亮 ---------- */
  function initNavHighlight() {
    const sections = $$("section[id]");
    const navItems = $$(".nav-item");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navItems.forEach((item) => {
              const active = item.getAttribute("href") === `#${id}`;
              item.style.opacity = active ? "1" : "0.4";
            });
          }
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* ---------- 5. 拼贴错落入场 ---------- */
  function initCollageEntrance() {
    const items = $$(".collage-item");
    items.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transition = `opacity 0.7s ease ${i * 0.1}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`;
    });
    window.addEventListener("load", () => {
      requestAnimationFrame(() => {
        items.forEach((el) => (el.style.opacity = "1"));
      });
    });
  }

  /* ---------- 6. 入口卡片视差微动 ---------- */
  function initEntryHover() {
    $$(".entry-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateX(8px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- 初始化 ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initCollageDrag();
    initModals();
    initSmoothScroll();
    initNavHighlight();
    initCollageEntrance();
    initEntryHover();
  });
})();
