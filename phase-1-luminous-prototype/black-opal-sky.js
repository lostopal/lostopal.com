(() => {
  const canvas = document.querySelector("[data-black-opal-sky]");
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const colors = [
    "255, 226, 158",
    "88, 202, 211",
    "102, 211, 165",
    "183, 101, 197",
    "232, 104, 83"
  ];
  const clouds = [
    { x: 0.16, y: 0.14, radius: 0.42, color: "54, 181, 188", alpha: 0.1, depth: 0.012, phase: 0.4 },
    { x: 0.84, y: 0.24, radius: 0.46, color: "176, 54, 133", alpha: 0.09, depth: 0.018, phase: 2.1 },
    { x: 0.64, y: 0.68, radius: 0.5, color: "51, 139, 102", alpha: 0.075, depth: 0.01, phase: 3.6 },
    { x: 0.22, y: 0.8, radius: 0.38, color: "80, 72, 172", alpha: 0.075, depth: 0.021, phase: 5.2 },
    { x: 0.72, y: 0.92, radius: 0.34, color: "221, 111, 55", alpha: 0.06, depth: 0.015, phase: 1.3 }
  ];

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let stars = [];
  let targetScroll = window.scrollY;
  let smoothScroll = targetScroll;
  let lastFrame = 0;
  let animationFrame = 0;

  function seeded(index, salt = 0) {
    const value = Math.sin((index + 1) * 9898.13 + salt * 781.31) * 43758.5453;
    return value - Math.floor(value);
  }

  function createStars() {
    const area = width * height;
    const count = Math.max(46, Math.min(width < 700 ? 78 : 150, Math.round(area / 10500)));
    stars = Array.from({ length: count }, (_, index) => ({
      x: seeded(index, 1) * width,
      y: seeded(index, 2) * height,
      radius: 0.45 + seeded(index, 3) * 1.35,
      alpha: 0.2 + seeded(index, 4) * 0.68,
      depth: 0.018 + seeded(index, 5) * 0.075,
      drift: (seeded(index, 6) - 0.5) * 0.012,
      color: colors[Math.floor(seeded(index, 7) * colors.length)],
      flare: seeded(index, 8) > 0.91
    }));
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createStars();
    draw(performance.now(), true);
  }

  function drawCloud(cloud, time, isStatic) {
    const shortSide = Math.min(width, height);
    const travel = (smoothScroll * cloud.depth) % (height * 1.35);
    const breathing = isStatic ? 0 : Math.sin(time * 0.00008 + cloud.phase) * shortSide * 0.025;
    const x = cloud.x * width + Math.sin(cloud.phase + time * 0.000035) * shortSide * (isStatic ? 0 : 0.035);
    const y = ((cloud.y * height + travel + breathing + height * 0.22) % (height * 1.45)) - height * 0.22;
    const radius = shortSide * cloud.radius;

    context.save();
    context.translate(x, y);
    context.rotate(Math.sin(cloud.phase) * 0.42);
    context.scale(1.38, 0.72);

    for (let lobe = 0; lobe < 4; lobe += 1) {
      const angle = cloud.phase + lobe * 1.73;
      const lobeX = Math.cos(angle) * radius * (0.16 + lobe * 0.045);
      const lobeY = Math.sin(angle * 1.21) * radius * (0.1 + lobe * 0.025);
      const lobeRadius = radius * (0.58 + seeded(lobe, cloud.phase) * 0.22);
      const lobeAlpha = cloud.alpha * (0.42 + lobe * 0.08);
      const gradient = context.createRadialGradient(lobeX, lobeY, 0, lobeX, lobeY, lobeRadius);
      gradient.addColorStop(0, `rgba(${cloud.color}, ${lobeAlpha})`);
      gradient.addColorStop(0.24, `rgba(${cloud.color}, ${lobeAlpha * 0.72})`);
      gradient.addColorStop(0.58, `rgba(${cloud.color}, ${lobeAlpha * 0.24})`);
      gradient.addColorStop(1, `rgba(${cloud.color}, 0)`);
      context.fillStyle = gradient;
      context.fillRect(lobeX - lobeRadius, lobeY - lobeRadius, lobeRadius * 2, lobeRadius * 2);
    }

    context.restore();
  }

  function drawStar(star, time, isStatic) {
    const travel = smoothScroll * star.depth;
    const y = (star.y + travel) % (height + 24) - 12;
    const x = star.x + (isStatic ? 0 : Math.sin(time * 0.00024 + star.y) * star.drift * width);
    const twinkle = isStatic ? 1 : 0.72 + Math.sin(time * 0.0012 + star.x) * 0.28;

    context.beginPath();
    context.arc(x, y, star.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(${star.color}, ${star.alpha * twinkle})`;
    context.shadowColor = `rgba(${star.color}, ${star.alpha * 0.78})`;
    context.shadowBlur = star.flare ? 12 : 5;
    context.fill();

    if (star.flare) {
      context.shadowBlur = 0;
      context.strokeStyle = `rgba(${star.color}, ${star.alpha * 0.34})`;
      context.lineWidth = 0.65;
      context.beginPath();
      context.moveTo(x - star.radius * 4.5, y);
      context.lineTo(x + star.radius * 4.5, y);
      context.moveTo(x, y - star.radius * 4.5);
      context.lineTo(x, y + star.radius * 4.5);
      context.stroke();
    }
  }

  function draw(time, forceStatic = false) {
    const isStatic = forceStatic || reduceMotion.matches;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
    context.shadowBlur = 0;
    clouds.forEach((cloud) => drawCloud(cloud, time, isStatic));

    context.globalCompositeOperation = "screen";
    stars.forEach((star) => drawStar(star, time, isStatic));
    context.globalCompositeOperation = "source-over";
    context.shadowBlur = 0;
  }

  function animate(time) {
    if (time - lastFrame < 42) {
      animationFrame = window.requestAnimationFrame(animate);
      return;
    }

    lastFrame = time;
    smoothScroll += (targetScroll - smoothScroll) * 0.075;
    draw(time);

    if (Math.abs(targetScroll - smoothScroll) > 0.45) {
      animationFrame = window.requestAnimationFrame(animate);
    } else {
      smoothScroll = targetScroll;
      draw(time);
      animationFrame = 0;
    }
  }

  function onScroll() {
    targetScroll = window.scrollY;
    if (reduceMotion.matches) {
      smoothScroll = targetScroll;
      draw(performance.now(), true);
    } else if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  }

  function syncMotionPreference() {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    smoothScroll = window.scrollY;
    targetScroll = smoothScroll;

    if (reduceMotion.matches) {
      canvas.dataset.motion = "static";
      draw(performance.now(), true);
    } else {
      canvas.dataset.motion = "scroll-reactive";
      draw(performance.now(), true);
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else {
      smoothScroll = window.scrollY;
      targetScroll = smoothScroll;
      draw(performance.now(), true);
    }
  });
  reduceMotion.addEventListener?.("change", syncMotionPreference);

  resize();
  canvas.dataset.skyReady = "true";
  syncMotionPreference();
})();
