import { useEffect, useRef, useCallback } from "react";

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
  wobbleAmplitude: number;
  wobbleSpeed: number;
  wobbleOffset: number;
}

interface Sparkle {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
  angle: number;
}

const GLOBE_RADIUS_RATIO = 0.35;
const BASE_HEIGHT_RATIO = 0.08;
const SNOWFLAKE_COUNT = 200;
const SPARKLE_COUNT = 30;

export function Snowglobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const animFrameRef = useRef<number>(0);

  const getGlobeGeometry = useCallback((width: number, height: number) => {
    const centerX = width / 2;
    const globeRadius = Math.min(width, height) * GLOBE_RADIUS_RATIO;
    const baseHeight = height * BASE_HEIGHT_RATIO;
    const centerY = height / 2 - baseHeight / 2;
    return { centerX, centerY, globeRadius, baseHeight };
  }, []);

  const createSnowflake = useCallback(
    (width: number, height: number, fromTop = false): Snowflake => {
      const { centerX, centerY, globeRadius } = getGlobeGeometry(
        width,
        height
      );
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (globeRadius - 4);
      return {
        x: fromTop
          ? centerX + (Math.random() - 0.5) * globeRadius * 1.6
          : centerX + Math.cos(angle) * dist,
        y: fromTop
          ? centerY - globeRadius * 0.8 + Math.random() * globeRadius * 0.3
          : centerY + Math.sin(angle) * dist,
        radius: Math.random() * 2.5 + 1,
        speed: Math.random() * 0.6 + 0.2,
        wind: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.4,
        wobbleAmplitude: Math.random() * 1.5 + 0.5,
        wobbleSpeed: Math.random() * 0.03 + 0.01,
        wobbleOffset: Math.random() * Math.PI * 2,
      };
    },
    [getGlobeGeometry]
  );

  const createSparkle = useCallback(
    (width: number, height: number): Sparkle => {
      const { centerX, centerY, globeRadius } = getGlobeGeometry(
        width,
        height
      );
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * globeRadius * 0.95;
      return {
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        life: 0,
        maxLife: Math.random() * 120 + 60,
        size: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
      };
    },
    [getGlobeGeometry]
  );

  const drawTree = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      baseY: number,
      scale: number
    ) => {
      ctx.save();
      ctx.translate(x, baseY);

      // trunk
      ctx.fillStyle = "#5D3A1A";
      ctx.fillRect(-3 * scale, -8 * scale, 6 * scale, 8 * scale);

      // layers of foliage
      const layers = [
        { w: 28, h: 22, y: -8 },
        { w: 22, h: 20, y: -22 },
        { w: 16, h: 18, y: -34 },
        { w: 10, h: 14, y: -44 },
      ];

      for (const layer of layers) {
        const gradient = ctx.createLinearGradient(
          0,
          layer.y * scale,
          0,
          (layer.y - layer.h) * scale
        );
        gradient.addColorStop(0, "#1B5E20");
        gradient.addColorStop(1, "#2E7D32");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, (layer.y - layer.h) * scale);
        ctx.lineTo((-layer.w / 2) * scale, layer.y * scale);
        ctx.lineTo((layer.w / 2) * scale, layer.y * scale);
        ctx.closePath();
        ctx.fill();
      }

      // star on top
      ctx.fillStyle = "#FFD700";
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 8 * scale;
      drawStar(ctx, 0, -57 * scale, 5 * scale, 5);
      ctx.shadowBlur = 0;

      ctx.restore();
    },
    []
  );

  const drawHouse = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      baseY: number,
      scale: number
    ) => {
      ctx.save();
      ctx.translate(x, baseY);

      // walls
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(-12 * scale, -16 * scale, 24 * scale, 16 * scale);

      // roof
      ctx.fillStyle = "#A52A2A";
      ctx.beginPath();
      ctx.moveTo(-15 * scale, -16 * scale);
      ctx.lineTo(0, -28 * scale);
      ctx.lineTo(15 * scale, -16 * scale);
      ctx.closePath();
      ctx.fill();

      // snow on roof
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.moveTo(-15 * scale, -16 * scale);
      ctx.lineTo(0, -28 * scale);
      ctx.lineTo(15 * scale, -16 * scale);
      ctx.lineTo(13 * scale, -15 * scale);
      ctx.quadraticCurveTo(7 * scale, -17 * scale, 0, -25 * scale);
      ctx.quadraticCurveTo(-7 * scale, -17 * scale, -13 * scale, -15 * scale);
      ctx.closePath();
      ctx.fill();

      // door
      ctx.fillStyle = "#5D3A1A";
      ctx.fillRect(-4 * scale, -10 * scale, 8 * scale, 10 * scale);

      // window glow
      ctx.fillStyle = "#FFF3B0";
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 6 * scale;
      ctx.fillRect(6 * scale, -13 * scale, 5 * scale, 5 * scale);
      ctx.shadowBlur = 0;

      ctx.restore();
    },
    []
  );

  const drawSnowman = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      baseY: number,
      scale: number
    ) => {
      ctx.save();
      ctx.translate(x, baseY);

      // body
      ctx.fillStyle = "#F0F0F0";
      ctx.beginPath();
      ctx.arc(0, -6 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -18 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -27 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // eyes
      ctx.fillStyle = "#1A1A1A";
      ctx.beginPath();
      ctx.arc(-1.5 * scale, -28 * scale, scale, 0, Math.PI * 2);
      ctx.arc(1.5 * scale, -28 * scale, scale, 0, Math.PI * 2);
      ctx.fill();

      // nose (carrot)
      ctx.fillStyle = "#FF6600";
      ctx.beginPath();
      ctx.moveTo(0, -26.5 * scale);
      ctx.lineTo(4 * scale, -25.5 * scale);
      ctx.lineTo(0, -25 * scale);
      ctx.closePath();
      ctx.fill();

      // hat
      ctx.fillStyle = "#1A1A1A";
      ctx.fillRect(-4 * scale, -35 * scale, 8 * scale, 4 * scale);
      ctx.fillRect(-3 * scale, -42 * scale, 6 * scale, 7 * scale);

      ctx.restore();
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      snowflakesRef.current = Array.from({ length: SNOWFLAKE_COUNT }, () =>
        createSnowflake(rect.width, rect.height)
      );
      sparklesRef.current = Array.from({ length: SPARKLE_COUNT }, () =>
        createSparkle(rect.width, rect.height)
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const handleClick = () => {
      shakeRef.current.intensity = 12;
    };
    canvas.addEventListener("click", handleClick);

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const { centerX, centerY, globeRadius, baseHeight } = getGlobeGeometry(
        width,
        height
      );

      time++;

      // shake decay
      const shake = shakeRef.current;
      if (shake.intensity > 0) {
        shake.x = (Math.random() - 0.5) * shake.intensity;
        shake.y = (Math.random() - 0.5) * shake.intensity;
        shake.intensity *= 0.94;
        if (shake.intensity < 0.3) shake.intensity = 0;
      } else {
        shake.x = 0;
        shake.y = 0;
      }

      ctx.save();
      ctx.translate(shake.x, shake.y);

      // background
      const bgGrad = ctx.createRadialGradient(
        centerX,
        centerY - 50,
        0,
        centerX,
        centerY,
        height
      );
      bgGrad.addColorStop(0, "#1a1a3e");
      bgGrad.addColorStop(0.5, "#0f0f2e");
      bgGrad.addColorStop(1, "#050520");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ambient stars in background
      for (let i = 0; i < 50; i++) {
        const sx =
          ((i * 137.5 + 50) % width) + Math.sin(time * 0.01 + i) * 0.5;
        const sy = ((i * 97.3 + 30) % (centerY - globeRadius - 20)) + 10;
        const sAlpha =
          0.3 + 0.3 * Math.sin(time * 0.02 + i * 0.7);
        ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // globe shadow
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(
        centerX,
        centerY + globeRadius + baseHeight + 10,
        globeRadius * 0.7,
        12,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      // globe interior gradient
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.clip();

      const interiorGrad = ctx.createRadialGradient(
        centerX,
        centerY - globeRadius * 0.3,
        0,
        centerX,
        centerY,
        globeRadius
      );
      interiorGrad.addColorStop(0, "#2a3a6e");
      interiorGrad.addColorStop(0.7, "#1a2550");
      interiorGrad.addColorStop(1, "#0e1530");
      ctx.fillStyle = interiorGrad;
      ctx.fillRect(
        centerX - globeRadius,
        centerY - globeRadius,
        globeRadius * 2,
        globeRadius * 2
      );

      // ground / snow inside
      const groundY = centerY + globeRadius * 0.55;
      const snowGrad = ctx.createLinearGradient(0, groundY - 20, 0, centerY + globeRadius);
      snowGrad.addColorStop(0, "#e8e8f0");
      snowGrad.addColorStop(1, "#c0c8e0");
      ctx.fillStyle = snowGrad;
      ctx.beginPath();
      ctx.moveTo(centerX - globeRadius, groundY);
      for (let i = 0; i <= 20; i++) {
        const px = centerX - globeRadius + (globeRadius * 2 * i) / 20;
        const py =
          groundY - 6 * Math.sin((i / 20) * Math.PI * 3 + time * 0.005);
        ctx.lineTo(px, py);
      }
      ctx.lineTo(centerX + globeRadius, centerY + globeRadius);
      ctx.lineTo(centerX - globeRadius, centerY + globeRadius);
      ctx.closePath();
      ctx.fill();

      // scene objects
      const sceneScale = globeRadius / 150;
      drawTree(ctx, centerX - globeRadius * 0.35, groundY - 3, sceneScale);
      drawHouse(ctx, centerX + globeRadius * 0.05, groundY - 3, sceneScale);
      drawSnowman(ctx, centerX + globeRadius * 0.4, groundY - 2, sceneScale * 0.8);
      drawTree(ctx, centerX + globeRadius * 0.65, groundY - 3, sceneScale * 0.6);

      // snowflakes
      const snowflakes = snowflakesRef.current;
      for (const flake of snowflakes) {
        const shakeWind = shake.intensity > 0 ? shake.x * 0.15 : 0;
        flake.y += flake.speed + (shake.intensity > 0 ? -shake.intensity * 0.2 : 0);
        flake.x +=
          flake.wind +
          Math.sin(time * flake.wobbleSpeed + flake.wobbleOffset) *
            flake.wobbleAmplitude *
            0.3 +
          shakeWind;

        const dx = flake.x - centerX;
        const dy = flake.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > globeRadius - 3 || flake.y > groundY + 5) {
          Object.assign(flake, createSnowflake(width, height, true));
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // sparkles inside
      const sparkles = sparklesRef.current;
      for (const sparkle of sparkles) {
        sparkle.life++;
        if (sparkle.life > sparkle.maxLife) {
          Object.assign(sparkle, createSparkle(width, height));
        }

        const lifeRatio = sparkle.life / sparkle.maxLife;
        const alpha =
          lifeRatio < 0.3
            ? lifeRatio / 0.3
            : lifeRatio > 0.7
              ? (1 - lifeRatio) / 0.3
              : 1;

        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = "#ffffff";
        drawStar(
          ctx,
          sparkle.x,
          sparkle.y,
          sparkle.size * (0.8 + 0.2 * Math.sin(time * 0.05 + sparkle.angle)),
          4
        );
        ctx.restore();
      }

      ctx.restore(); // end globe clip

      // glass dome
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);

      ctx.strokeStyle = "rgba(180, 210, 240, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // glass reflection highlight
      const reflGrad = ctx.createRadialGradient(
        centerX - globeRadius * 0.3,
        centerY - globeRadius * 0.3,
        0,
        centerX,
        centerY,
        globeRadius
      );
      reflGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      reflGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.05)");
      reflGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = reflGrad;
      ctx.fill();

      // crescent reflection
      ctx.beginPath();
      ctx.arc(
        centerX - globeRadius * 0.25,
        centerY - globeRadius * 0.2,
        globeRadius * 0.85,
        -Math.PI * 0.4,
        -Math.PI * 0.1
      );
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // base / pedestal
      const baseTop = centerY + globeRadius;
      const baseW = globeRadius * 0.8;

      // base connector ring
      ctx.save();
      const ringGrad = ctx.createLinearGradient(
        centerX - baseW,
        baseTop,
        centerX + baseW,
        baseTop
      );
      ringGrad.addColorStop(0, "#8B6914");
      ringGrad.addColorStop(0.3, "#DAA520");
      ringGrad.addColorStop(0.5, "#FFD700");
      ringGrad.addColorStop(0.7, "#DAA520");
      ringGrad.addColorStop(1, "#8B6914");
      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, baseTop, baseW, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // wooden base body
      ctx.save();
      const woodGrad = ctx.createLinearGradient(
        centerX - baseW,
        baseTop,
        centerX + baseW,
        baseTop + baseHeight
      );
      woodGrad.addColorStop(0, "#6B3A2A");
      woodGrad.addColorStop(0.5, "#8B4513");
      woodGrad.addColorStop(1, "#5C2E0E");
      ctx.fillStyle = woodGrad;
      ctx.beginPath();
      ctx.moveTo(centerX - baseW, baseTop);
      ctx.lineTo(centerX - baseW * 1.15, baseTop + baseHeight);
      ctx.lineTo(centerX + baseW * 1.15, baseTop + baseHeight);
      ctx.lineTo(centerX + baseW, baseTop);
      ctx.closePath();
      ctx.fill();

      // base bottom edge
      ctx.fillStyle = "#4A2010";
      ctx.beginPath();
      ctx.ellipse(
        centerX,
        baseTop + baseHeight,
        baseW * 1.15,
        6,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      // "Click to shake" text
      ctx.save();
      ctx.fillStyle = `rgba(180, 200, 230, ${0.4 + 0.15 * Math.sin(time * 0.03)})`;
      ctx.font = `${Math.max(12, globeRadius * 0.09)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(
        "click to shake",
        centerX,
        baseTop + baseHeight + 30
      );
      ctx.restore();

      ctx.restore(); // end shake transform

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    createSnowflake,
    createSparkle,
    getGlobeGeometry,
    drawTree,
    drawHouse,
    drawSnowman,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-pointer"
      style={{ display: "block" }}
    />
  );
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  points: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const dist = i % 2 === 0 ? r : r * 0.4;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}
