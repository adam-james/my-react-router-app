import type { Route } from "./+types/home";
import { useEffect, useRef } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bouncing Ball" },
    { name: "description", content: "An interactive bouncing ball" },
  ];
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const ball = {
      x: width / 2,
      y: height / 3,
      radius: 28,
      vx: 4.5,
      vy: 0,
      gravity: 0.5,
      damping: 0.8,
      friction: 0.99,
      hue: 210,
    };

    const trail: { x: number; y: number; alpha: number; hue: number }[] = [];

    let dragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragEnd = { x: 0, y: 0 };
    let mouse = { x: 0, y: 0 };

    function isOverBall(mx: number, my: number) {
      const dx = mx - ball.x;
      const dy = my - ball.y;
      return dx * dx + dy * dy <= (ball.radius + 10) * (ball.radius + 10);
    }

    function getPos(e: MouseEvent | TouchEvent) {
      if ("touches" in e) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    }

    function onPointerDown(e: MouseEvent | TouchEvent) {
      const pos = getPos(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
      if (isOverBall(pos.x, pos.y)) {
        dragging = true;
        ball.vx = 0;
        ball.vy = 0;
        dragStart = { x: pos.x, y: pos.y };
        dragEnd = { x: pos.x, y: pos.y };
        ball.x = pos.x;
        ball.y = pos.y;
        e.preventDefault();
      }
    }

    function onPointerMove(e: MouseEvent | TouchEvent) {
      const pos = getPos(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
      if (dragging) {
        dragEnd = { x: pos.x, y: pos.y };
        ball.x = pos.x;
        ball.y = pos.y;
        e.preventDefault();
      }
    }

    function onPointerUp(e: MouseEvent | TouchEvent) {
      if (dragging) {
        const flingStrength = 0.3;
        ball.vx = (dragEnd.x - dragStart.x) * flingStrength;
        ball.vy = (dragEnd.y - dragStart.y) * flingStrength;

        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        const maxSpeed = 30;
        if (speed > maxSpeed) {
          ball.vx = (ball.vx / speed) * maxSpeed;
          ball.vy = (ball.vy / speed) * maxSpeed;
        }

        dragging = false;
      }
    }

    function onClick(e: MouseEvent) {
      if (!isOverBall(e.clientX, e.clientY)) {
        const dx = e.clientX - ball.x;
        const dy = e.clientY - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const impulse = Math.min(15, dist * 0.05);
        ball.vx += (dx / dist) * impulse;
        ball.vy += (dy / dist) * impulse;
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      const boost = 8;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          ball.vy -= boost;
          break;
        case "ArrowDown":
        case "s":
          ball.vy += boost;
          break;
        case "ArrowLeft":
        case "a":
          ball.vx -= boost;
          break;
        case "ArrowRight":
        case "d":
          ball.vx += boost;
          break;
        case " ":
          ball.vy = -18;
          break;
        case "r":
          ball.x = width / 2;
          ball.y = height / 3;
          ball.vx = 4.5;
          ball.vy = 0;
          ball.hue = 210;
          trail.length = 0;
          break;
        case "g":
          ball.gravity = ball.gravity === 0 ? 0.5 : 0;
          break;
      }
    }

    canvas.addEventListener("mousedown", onPointerDown);
    canvas.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    canvas.addEventListener("touchstart", onPointerDown, { passive: false });
    canvas.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
    canvas.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);

    function resize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);

    let animationId: number;

    function draw() {
      ctx!.fillStyle = "rgba(15, 15, 25, 0.3)";
      ctx!.fillRect(0, 0, width, height);

      for (const t of trail) {
        ctx!.beginPath();
        ctx!.arc(t.x, t.y, ball.radius * 0.6, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${t.hue}, 80%, 65%, ${t.alpha})`;
        ctx!.fill();
        t.alpha *= 0.92;
      }

      while (trail.length > 0 && trail[0].alpha < 0.01) trail.shift();

      if (!dragging) {
        ball.vy += ball.gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;
      }

      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      ball.hue = (210 + speed * 5) % 360;

      let bounced = false;

      if (ball.y + ball.radius > height) {
        ball.y = height - ball.radius;
        ball.vy = -ball.vy * ball.damping;
        ball.vx *= ball.friction;
        bounced = true;
      }

      if (ball.x + ball.radius > width) {
        ball.x = width - ball.radius;
        ball.vx = -ball.vx * ball.damping;
        bounced = true;
      } else if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx * ball.damping;
        bounced = true;
      }

      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * ball.damping;
        bounced = true;
      }

      if (bounced) {
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = Math.random() * 3 + 1;
          trail.push({
            x: ball.x + Math.cos(angle) * ball.radius,
            y: ball.y + Math.sin(angle) * ball.radius,
            alpha: 0.6,
            hue: ball.hue,
          });
        }
      }

      trail.push({ x: ball.x, y: ball.y, alpha: 0.35, hue: ball.hue });

      const lightHsl = `hsl(${ball.hue}, 80%, 85%)`;
      const midHsl = `hsl(${ball.hue}, 80%, 60%)`;
      const darkHsl = `hsl(${ball.hue}, 80%, 30%)`;

      const gradient = ctx!.createRadialGradient(
        ball.x - ball.radius * 0.3,
        ball.y - ball.radius * 0.3,
        ball.radius * 0.1,
        ball.x,
        ball.y,
        ball.radius
      );
      gradient.addColorStop(0, lightHsl);
      gradient.addColorStop(0.5, midHsl);
      gradient.addColorStop(1, darkHsl);

      ctx!.beginPath();
      ctx!.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx!.fillStyle = gradient;
      ctx!.fill();

      ctx!.shadowColor = midHsl;
      ctx!.shadowBlur = 20;
      ctx!.beginPath();
      ctx!.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx!.fillStyle = gradient;
      ctx!.fill();
      ctx!.shadowBlur = 0;

      if (dragging) {
        ctx!.beginPath();
        ctx!.arc(ball.x, ball.y, ball.radius + 6, 0, Math.PI * 2);
        ctx!.strokeStyle = `hsla(${ball.hue}, 80%, 70%, 0.5)`;
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }

      if (ball.y + ball.radius >= height - 1) {
        const squish = Math.min(0.3, Math.abs(ball.vy) * 0.02);
        ctx!.beginPath();
        ctx!.ellipse(
          ball.x,
          height,
          ball.radius * (1 + squish),
          4,
          0,
          0,
          Math.PI * 2
        );
        ctx!.fillStyle = `hsla(${ball.hue}, 80%, 65%, 0.15)`;
        ctx!.fill();
      }

      ctx!.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx!.font = "13px system-ui, sans-serif";
      ctx!.textAlign = "left";
      const lines = [
        "Drag ball to fling",
        "Click anywhere to push",
        "Arrow keys / WASD to nudge",
        "Space to jump",
        "G to toggle gravity",
        "R to reset",
      ];
      for (let i = 0; i < lines.length; i++) {
        ctx!.fillText(lines[i], 16, 28 + i * 20);
      }

      animationId = requestAnimationFrame(draw);
    }

    ctx.fillStyle = "#0f0f19";
    ctx.fillRect(0, 0, width, height);
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousedown", onPointerDown);
      canvas.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      canvas.removeEventListener("touchstart", onPointerDown);
      canvas.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
}
