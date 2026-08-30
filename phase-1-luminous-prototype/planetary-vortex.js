(() => {
  const canvases = document.querySelectorAll("[data-planetary-vortex]");

  if (!canvases.length) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const palette = [
    { rgb: "66, 205, 220" },
    { rgb: "58, 191, 132" },
    { rgb: "238, 182, 76" },
    { rgb: "235, 104, 63" },
    { rgb: "202, 66, 139" },
    { rgb: "128, 91, 196" }
  ];

  function seededRandom(seed) {
    let value = seed >>> 0;

    return () => {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createCloudSprite(color, random) {
    const size = 180;
    const sprite = document.createElement("canvas");
    const spriteContext = sprite.getContext("2d");
    sprite.width = size;
    sprite.height = size;

    for (let index = 0; index < 13; index += 1) {
      const x = size * (0.26 + random() * 0.48);
      const y = size * (0.28 + random() * 0.44);
      const radius = size * (0.16 + random() * 0.24);
      const cloud = spriteContext.createRadialGradient(x, y, 0, x, y, radius);
      cloud.addColorStop(0, `rgba(${color.rgb}, ${0.11 + random() * 0.08})`);
      cloud.addColorStop(0.42, `rgba(${color.rgb}, ${0.035 + random() * 0.035})`);
      cloud.addColorStop(1, `rgba(${color.rgb}, 0)`);
      spriteContext.fillStyle = cloud;
      spriteContext.fillRect(0, 0, size, size);
    }

    const paleCore = spriteContext.createRadialGradient(
      size * 0.48,
      size * 0.5,
      0,
      size * 0.48,
      size * 0.5,
      size * 0.34
    );
    paleCore.addColorStop(0, "rgba(235, 245, 239, 0.08)");
    paleCore.addColorStop(1, "rgba(235, 245, 239, 0)");
    spriteContext.fillStyle = paleCore;
    spriteContext.fillRect(0, 0, size, size);

    return sprite;
  }

  canvases.forEach((canvas, canvasIndex) => {
    const context = canvas.getContext("2d", { alpha: true, desynchronized: true });

    if (!context) {
      return;
    }

    const isIntroProfile = canvas.dataset.vortexQuality === "intro";
    const cloudCount = isIntroProfile ? 8 : 17;
    const starCount = isIntroProfile ? 48 : 105;
    const dustCount = isIntroProfile ? 56 : 150;
    const frameInterval = isIntroProfile ? 42 : 32;
    const pixelRatioCap = isIntroProfile ? 1 : 1.75;
    const random = seededRandom(4507 + canvasIndex * 211);
    const cloudSprites = palette.map((color) => createCloudSprite(color, random));
    const arms = palette.map((color, armIndex) => ({
      color,
      angle: (armIndex / palette.length) * Math.PI * 2 + random() * 0.42,
      turns: 0.72 + random() * 0.34,
      speed: 0.76 + random() * 0.36,
      clouds: Array.from({ length: cloudCount }, (_, cloudIndex) => ({
        progress: Math.min(0.98, Math.max(0.02, (cloudIndex + 0.5) / cloudCount + (random() - 0.5) * 0.055)),
        radialShift: (random() - 0.5) * 0.11,
        scale: 0.72 + random() * 0.7,
        opacity: 0.35 + random() * 0.38,
        tilt: (random() - 0.5) * 0.8,
        phase: random() * Math.PI * 2
      }))
    }));
    const stars = Array.from({ length: starCount }, () => ({
      angle: random() * Math.PI * 2,
      radius: Math.sqrt(random()) * 0.95,
      size: 0.3 + random() * 1.15,
      phase: random() * Math.PI * 2,
      warmth: random() > 0.68
    }));
    const dust = Array.from({ length: dustCount }, () => ({
      arm: Math.floor(random() * arms.length),
      progress: random(),
      offset: (random() - 0.5) * 0.14,
      size: 0.24 + random() * 0.92,
      phase: random() * Math.PI * 2,
      warmth: random() > 0.72
    }));

    let width = 0;
    let height = 0;
    let visible = false;
    let frame = 0;
    let lastPaint = -Infinity;

    function spiralPoint(arm, progress, time, centerX, centerY, outerRadius, radialShift = 0) {
      const eased = Math.pow(1 - progress, 0.69);
      const radius = outerRadius * (0.1 + 0.86 * eased + radialShift * (1 - progress));
      const angle =
        arm.angle +
        progress * arm.turns * Math.PI * 2 +
        time * 0.082 * arm.speed +
        Math.sin(progress * Math.PI * 3 + time * 0.22 + arm.angle) * 0.055;

      return {
        angle,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    }

    function drawCopperGeometry(centerX, centerY, radius) {
      context.save();
      context.globalCompositeOperation = "source-over";
      context.shadowColor = "rgba(218, 146, 66, 0.28)";
      context.shadowBlur = 5;
      context.strokeStyle = "rgba(222, 159, 82, 0.42)";
      context.lineWidth = Math.max(0.6, radius * 0.0024);

      [0.985, 0.948, 0.84, 0.66].forEach((scale, index) => {
        context.beginPath();
        context.setLineDash(index === 2 ? [2, 6] : []);
        context.arc(centerX, centerY, radius * scale, 0, Math.PI * 2);
        context.stroke();
      });
      context.setLineDash([]);

      const points = [
        [0, -0.65],
        [0.58, -0.25],
        [0.58, 0.38],
        [0, 0.67],
        [-0.58, 0.38],
        [-0.58, -0.25]
      ].map(([x, y]) => [centerX + x * radius, centerY + y * radius]);

      context.strokeStyle = "rgba(218, 143, 71, 0.3)";
      points.forEach(([x, y]) => {
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(x, y);
        context.stroke();
      });

      [[0, 2, 4, 0], [1, 3, 5, 1]].forEach((path) => {
        context.beginPath();
        path.forEach((pointIndex, index) => {
          const [x, y] = points[pointIndex];
          if (index === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        });
        context.stroke();
      });

      points.forEach(([x, y]) => {
        context.beginPath();
        context.fillStyle = "rgba(241, 184, 98, 0.58)";
        context.arc(x, y, Math.max(1.3, radius * 0.006), 0, Math.PI * 2);
        context.fill();
      });

      for (let cardinal = 0; cardinal < 4; cardinal += 1) {
        const angle = cardinal * Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * 0.9;
        const y = centerY + Math.sin(angle) * radius * 0.9;
        context.save();
        context.translate(x, y);
        context.rotate(angle);
        context.beginPath();
        context.moveTo(-radius * 0.026, 0);
        context.lineTo(radius * 0.026, 0);
        context.moveTo(0, -radius * 0.026);
        context.lineTo(0, radius * 0.026);
        context.stroke();
        context.restore();
      }

      context.restore();
    }

    function paint(timestamp) {
      if (!width || !height) {
        return;
      }

      const time = timestamp / 1000;
      const centerX = width / 2;
      const centerY = height / 2;
      const outerRadius = Math.min(width, height) * 0.49;

      context.clearRect(0, 0, width, height);
      context.save();
      context.beginPath();
      context.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      context.clip();

      const night = context.createRadialGradient(
        centerX,
        centerY,
        outerRadius * 0.06,
        centerX,
        centerY,
        outerRadius
      );
      night.addColorStop(0, "#010207");
      night.addColorStop(0.48, "#050a12");
      night.addColorStop(0.78, "#080713");
      night.addColorStop(1, "#020407");
      context.fillStyle = night;
      context.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        const angle = star.angle + time * 0.012 * (1.15 - star.radius);
        const radius = outerRadius * star.radius;
        const pulse = 0.34 + Math.sin(time * 0.72 + star.phase) * 0.16;
        context.beginPath();
        context.arc(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius,
          star.size,
          0,
          Math.PI * 2
        );
        context.fillStyle = star.warmth
          ? `rgba(255, 211, 139, ${pulse})`
          : `rgba(174, 222, 231, ${pulse * 0.78})`;
        context.fill();
      });

      context.globalCompositeOperation = "screen";

      arms.forEach((arm, armIndex) => {
        arm.clouds.forEach((cloud) => {
          const point = spiralPoint(
            arm,
            cloud.progress,
            time,
            centerX,
            centerY,
            outerRadius,
            cloud.radialShift
          );
          const size = outerRadius * (0.27 - cloud.progress * 0.1) * cloud.scale;
          const pulse = 0.9 + Math.sin(time * 0.28 + cloud.phase) * 0.1;

          context.save();
          context.translate(point.x, point.y);
          context.rotate(point.angle + Math.PI / 2 + cloud.tilt);
          context.scale(1.65, 0.72);
          context.globalAlpha = cloud.opacity * pulse;
          context.drawImage(cloudSprites[armIndex], -size / 2, -size / 2, size, size);
          context.restore();
        });
      });

      dust.forEach((particle) => {
        const arm = arms[particle.arm];
        const progress = (particle.progress + time * 0.0045 * arm.speed) % 1;
        const point = spiralPoint(arm, progress, time, centerX, centerY, outerRadius);
        const offsetScale = outerRadius * particle.offset * (0.38 + (1 - progress) * 0.62);
        const x = point.x + Math.cos(point.angle + Math.PI / 2) * offsetScale;
        const y = point.y + Math.sin(point.angle + Math.PI / 2) * offsetScale;
        const alpha = 0.22 + Math.sin(time * 0.66 + particle.phase) * 0.12;
        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fillStyle = particle.warmth
          ? `rgba(255, 206, 123, ${alpha})`
          : `rgba(205, 236, 230, ${alpha * 0.8})`;
        context.fill();
      });

      const core = context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        outerRadius * 0.32
      );
      core.addColorStop(0, "rgba(255, 218, 126, 0.34)");
      core.addColorStop(0.22, "rgba(237, 142, 72, 0.18)");
      core.addColorStop(0.58, "rgba(187, 69, 139, 0.08)");
      core.addColorStop(1, "rgba(187, 69, 139, 0)");
      context.fillStyle = core;
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = "source-over";
      const vignette = context.createRadialGradient(
        centerX,
        centerY,
        outerRadius * 0.55,
        centerX,
        centerY,
        outerRadius
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.48)");
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);

      drawCopperGeometry(centerX, centerY, outerRadius);
      context.restore();
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, bounds.width);
      const nextHeight = Math.max(1, bounds.height);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, pixelRatioCap);

      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(nextWidth * pixelRatio);
      canvas.height = Math.round(nextHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      paint(performance.now());
    }

    function tick(timestamp) {
      frame = 0;

      if (!visible || document.hidden || reducedMotion.matches) {
        return;
      }

      if (timestamp - lastPaint >= frameInterval) {
        paint(timestamp);
        lastPaint = timestamp;
      }

      frame = requestAnimationFrame(tick);
    }

    function syncAnimation() {
      if (reducedMotion.matches) {
        if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        paint(0);
        return;
      }

      if (visible && !document.hidden && !frame) {
        frame = requestAnimationFrame(tick);
      } else if ((!visible || document.hidden) && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncAnimation();
      },
      { rootMargin: "120px 0px", threshold: 0.04 }
    ).observe(canvas);

    document.addEventListener("visibilitychange", syncAnimation);
    reducedMotion.addEventListener?.("change", syncAnimation);
    resize();
  });
})();
