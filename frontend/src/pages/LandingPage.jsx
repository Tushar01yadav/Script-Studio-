import React, { useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  DocumentTextIcon, 
  FilmIcon, 
  MicrophoneIcon, 
  DevicePhoneMobileIcon, 
  LockClosedIcon, 
  BoltIcon 
} from '@heroicons/react/24/outline';

/* ─── Particle Canvas Background ─────────────────────────────────── */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const PARTICLE_COUNT = 120;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const onMouse = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      particles.forEach((p, i) => {
        // Subtle mouse repulsion
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.vx += (dx / dist) * 0.08;
          p.vy += (dy / dist) * 0.08;
        }

        // Speed cap
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) { p.vx *= 0.9; p.vy *= 0.9; }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};

/* ─── Animated Counter ────────────────────────────────────────────── */
const CountUp = ({ to, suffix = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    const controls = animate(0, to, {
      duration: 2,
      delay: 1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (node) node.textContent = Math.round(v).toLocaleString() + suffix;
      },
    });
    return () => controls.stop();
  }, [to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
};

/* ─── Feature Card ────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className="group p-6 rounded-2xl border border-white/8 bg-white/3 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-300 cursor-default"
  >
    <div className="mb-4">
      <Icon className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
    </div>
    <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
  </motion.div>
);

/* ─── Main Landing Page ───────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Word-by-word stagger for headline — clean opacity + y, no rotateX glitch
  const headline1 = 'Script your next';
  const headline2 = 'viral masterpiece.';

  const wordVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 3,
        delay: 0.3 + i * 0.15,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] overflow-hidden flex flex-col">
      {/* Particle background */}
      <ParticleCanvas />

      {/* Ambient radial glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      {/* ── Nav ──────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5"
      >
        <div className="flex items-center gap-2.5">
          {/* YouTube Logo — static gemstone variant */}
          <svg className="h-7 w-auto drop-shadow-md" viewBox="0 0 120 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="rubyStatic" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ff8080" />
                <stop offset="30%" stopColor="#ff1a1a" />
                <stop offset="70%" stopColor="#d90000" />
                <stop offset="100%" stopColor="#990000" />
              </radialGradient>
              <linearGradient id="bevelStatic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
              </linearGradient>
            </defs>
            {/* Main faceted body */}
            <path d="M116.892 13.111C115.522 7.974 111.41 3.861 106.273 2.492C96.942 0 59.5 0 59.5 0S22.058 0 12.727 2.492A12.012 12.012 0 0 0 2.108 13.111C0 22.441 0 41.833 0 41.833S0 61.224 2.108 70.556A12.012 12.012 0 0 0 12.727 81.175C22.058 83.667 59.5 83.667 59.5 83.667S96.942 83.667 106.273 81.175a12.012 12.012 0 0 0 10.619-10.619C119 61.224 119 41.833 119 41.833S119 22.441 116.892 13.111Z" fill="url(#rubyStatic)" />
            {/* Top specular sheen */}
            <path d="M12.727 2.492C22.058 0 59.5 0 59.5 0S96.942 0 106.273 2.492C111.41 3.861 115.522 7.974 116.892 13.111C115 18 100 24 59.5 26C19 24 4 18 2.108 13.111A12.012 12.012 0 0 1 12.727 2.492Z" fill="white" opacity="0.3" />
            {/* Sharp gemstone bevel rim */}
            <path d="M116.892 13.111C115.522 7.974 111.41 3.861 106.273 2.492C96.942 0 59.5 0 59.5 0S22.058 0 12.727 2.492A12.012 12.012 0 0 0 2.108 13.111C0 22.441 0 41.833 0 41.833S0 61.224 2.108 70.556A12.012 12.012 0 0 0 12.727 81.175C22.058 83.667 59.5 83.667 59.5 83.667S96.942 83.667 106.273 81.175a12.012 12.012 0 0 0 10.619-10.619C119 61.224 119 41.833 119 41.833S119 22.441 116.892 13.111Z" stroke="url(#bevelStatic)" strokeWidth="1.5" fill="none" />
            {/* Play icon with depth shadow */}
            <path d="M47.6 59.762V23.904L78.54 41.833 47.6 59.762Z" fill="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          </svg>
          <span className="text-lg font-bold tracking-tight text-white">Script Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors cursor-pointer"
          >
            Get started
          </button>
        </div>
      </motion.nav>

      {/* ── Hero Section ─────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-4 pt-8 pb-16">



        {/* 3D Revolving YouTube Logo & Growth Arrow Background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotateX: -5 }}
          animate={{ opacity: 1, scale: 1, rotateX: -5 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6 flex justify-center items-center"
          style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
        >
          {/* Animated Glowing Growth Arrow (Physically pushed behind logo in Z-space) */}
          <motion.div 
            className="absolute pointer-events-none"
            animate={{ opacity: [0.9, 0.1, 0.9] }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: 2.5 }}
            style={{ 
              width: '600px', height: '300px', 
              top: '50%', left: '50%', 
              transform: 'translate(-50%, -45%) translateZ(-120px)' 
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 600 300" fill="none" className="drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]">
              <defs>
                <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#166534" stopOpacity="0" />
                  <stop offset="40%" stopColor="#22c55e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Jagged Growth Line */}
              <motion.path
                animate={{ pathLength: [0, 1, 1, 0] }}
                transition={{ duration: 7, times: [0, 0.21, 0.93, 1], repeat: Infinity, ease: "easeInOut" }}
                d="M 50 250 L 160 220 L 220 250 L 340 150 L 400 180 L 520 90"
                stroke="url(#arrowGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Arrow Head Chevron */}
              <motion.path
                animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }}
                transition={{ duration: 7, times: [0, 0.15, 0.21, 0.93, 1], repeat: Infinity, ease: "easeOut" }}
                d="M 470 90 L 520 90 L 520 140"
                stroke="#4ade80"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 10, ease: 'linear', repeat: Infinity }}
            style={{ transformStyle: 'preserve-3d', display: 'inline-block' }}
          >
            {/* True CSS 3D Z-axis depth — Diamond/Gemstone Material */}
            <div style={{
              position: 'relative',
              display: 'inline-block',
              width: 130,
              height: 91,
              transformStyle: 'preserve-3d',
            }}>
              {/* Material Definitions */}
              <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                  {/* Diamond Ruby Base — smooth radial curve, highly vibrant red */}
                  <radialGradient id="rubyBase" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ff8080" />
                    <stop offset="30%" stopColor="#ff1a1a" />
                    <stop offset="70%" stopColor="#d90000" />
                    <stop offset="100%" stopColor="#990000" />
                  </radialGradient>
                  {/* Outer Bevel / Edge Shine */}
                  <linearGradient id="rubyBevel" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                    <stop offset="40%" stopColor="rgba(255,255,255,0.1)" />
                    <stop offset="60%" stopColor="rgba(0,0,0,0.2)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
                  </linearGradient>
                  {/* Depth Extrusion Material — brighter solid extrusion */}
                  <linearGradient id="depthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff1a1a" />
                    <stop offset="20%" stopColor="#d90000" />
                    <stop offset="80%" stopColor="#b30000" />
                    <stop offset="100%" stopColor="#800000" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Back face — rotated 180deg */}
              <svg
                width="130" height="91" viewBox="0 0 120 84" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  transform: 'translateZ(-24px) rotateY(180deg)',
                  filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.6))',
                }}
              >
                <path d="M116.892 13.111C115.522 7.974 111.41 3.861 106.273 2.492C96.942 0 59.5 0 59.5 0S22.058 0 12.727 2.492A12.012 12.012 0 0 0 2.108 13.111C0 22.441 0 41.833 0 41.833S0 61.224 2.108 70.556A12.012 12.012 0 0 0 12.727 81.175C22.058 83.667 59.5 83.667 59.5 83.667S96.942 83.667 106.273 81.175a12.012 12.012 0 0 0 10.619-10.619C119 61.224 119 41.833 119 41.833S119 22.441 116.892 13.111Z" fill="url(#rubyBase)" />
                <path d="M12.727 2.492C22.058 0 59.5 0 59.5 0S96.942 0 106.273 2.492C111.41 3.861 115.522 7.974 116.892 13.111C115 18 100 24 59.5 26C19 24 4 18 2.108 13.111A12.012 12.012 0 0 1 12.727 2.492Z" fill="white" opacity="0.3" />
                <path d="M116.892 13.111C115.522 7.974 111.41 3.861 106.273 2.492C96.942 0 59.5 0 59.5 0S22.058 0 12.727 2.492A12.012 12.012 0 0 0 2.108 13.111C0 22.441 0 41.833 0 41.833S0 61.224 2.108 70.556A12.012 12.012 0 0 0 12.727 81.175C22.058 83.667 59.5 83.667 59.5 83.667S96.942 83.667 106.273 81.175a12.012 12.012 0 0 0 10.619-10.619C119 61.224 119 41.833 119 41.833S119 22.441 116.892 13.111Z" stroke="url(#rubyBevel)" strokeWidth="1.5" fill="none" />
                <path d="M47.6 59.762V23.904L78.54 41.833 47.6 59.762Z" fill="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
              </svg>

              {/* Z-axis depth slices — glossy extrusion material */}
              {[15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((i) => (
                <svg
                  key={i}
                  width="130" height="91" viewBox="0 0 120 84" fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    transform: `translateZ(-${i * 1.5}px)`,
                  }}
                >
                  <path
                    d="M116.892 13.111C115.522 7.974 111.41 3.861 106.273 2.492C96.942 0 59.5 0 59.5 0S22.058 0 12.727 2.492A12.012 12.012 0 0 0 2.108 13.111C0 22.441 0 41.833 0 41.833S0 61.224 2.108 70.556A12.012 12.012 0 0 0 12.727 81.175C22.058 83.667 59.5 83.667 59.5 83.667S96.942 83.667 106.273 81.175a12.012 12.012 0 0 0 10.619-10.619C119 61.224 119 41.833 119 41.833S119 22.441 116.892 13.111Z"
                    fill="url(#depthGradient)"
                  />
                </svg>
              ))}
              {/* Front face — glossy surface at Z=0 */}
              <svg
                width="130" height="91" viewBox="0 0 120 84" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  transform: 'translateZ(0px)',
                  filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.6))',
                }}
              >
                {/* Main faceted body */}
                <path
                  d="M116.892 13.111C115.522 7.974 111.41 3.861 106.273 2.492C96.942 0 59.5 0 59.5 0S22.058 0 12.727 2.492A12.012 12.012 0 0 0 2.108 13.111C0 22.441 0 41.833 0 41.833S0 61.224 2.108 70.556A12.012 12.012 0 0 0 12.727 81.175C22.058 83.667 59.5 83.667 59.5 83.667S96.942 83.667 106.273 81.175a12.012 12.012 0 0 0 10.619-10.619C119 61.224 119 41.833 119 41.833S119 22.441 116.892 13.111Z"
                  fill="url(#rubyBase)"
                />
                {/* Top specular sheen */}
                <path
                  d="M12.727 2.492C22.058 0 59.5 0 59.5 0S96.942 0 106.273 2.492C111.41 3.861 115.522 7.974 116.892 13.111C115 18 100 24 59.5 26C19 24 4 18 2.108 13.111A12.012 12.012 0 0 1 12.727 2.492Z"
                  fill="white"
                  opacity="0.3"
                />
                {/* Sharp gemstone bevel rim */}
                <path
                  d="M116.892 13.111C115.522 7.974 111.41 3.861 106.273 2.492C96.942 0 59.5 0 59.5 0S22.058 0 12.727 2.492A12.012 12.012 0 0 0 2.108 13.111C0 22.441 0 41.833 0 41.833S0 61.224 2.108 70.556A12.012 12.012 0 0 0 12.727 81.175C22.058 83.667 59.5 83.667 59.5 83.667S96.942 83.667 106.273 81.175a12.012 12.012 0 0 0 10.619-10.619C119 61.224 119 41.833 119 41.833S119 22.441 116.892 13.111Z"
                  stroke="url(#rubyBevel)"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Play icon with depth shadow */}
                <path d="M47.6 59.762V23.904L78.54 41.833 47.6 59.762Z" fill="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Headline — stagger entry then subtle infinite float */}
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, delay: 2 }}
          className="w-full max-w-5xl"
        >
          <motion.h1 
            animate={{
              filter: [
                "drop-shadow(0 0 0px rgba(255,255,255,0))",
                "drop-shadow(0 0 20px rgba(255,255,255,0.4))",
                "drop-shadow(0 0 20px rgba(255,255,255,0.4))",
                "drop-shadow(0 0 0px rgba(255,255,255,0))"
              ]
            }}
            transition={{ duration: 6, times: [0, 0.15, 0.65, 1], ease: 'easeInOut', repeat: Infinity, delay: 3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05] text-white"
          >
            {/* Line 1 */}
            <span className="block mb-2">
              {headline1.split(' ').map((word, i) => (
                <motion.span
                  key={`l1-${i}`}
                  custom={i}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            {/* Line 2 — accent gradient */}
            <span className="block">
              {headline2.split(' ').map((word, i) => (
                <motion.span
                  key={`l2-${i}`}
                  custom={headline1.split(' ').length + i}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-block mr-[0.25em]"
                  style={{
                    color: 'transparent',
                    backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: 'easeOut' }}
          className="mt-6 text-sm sm:text-base md:text-lg text-gray-400 max-w-xl leading-relaxed px-4"
        >
          Generate polished scripts, break them into cinematic scenes, and synthesize professional voiceovers — all in one beautiful workspace.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0, ease: 'easeOut' }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={() => navigate('/register')}
            className="group relative overflow-hidden px-8 py-3.5 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Creating Free
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 text-base font-semibold text-gray-300 hover:text-white border border-white/10 hover:border-white/25 rounded-xl transition-all cursor-pointer"
          >
            Sign in to Studio
          </button>
        </motion.div>

        {/* Social proof stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.4 }}
          className="mt-14 flex flex-wrap justify-center gap-8 md:gap-16 text-center"
        >
          {[
            { label: 'Scripts Generated', value: 12000, suffix: '+' },
            { label: 'Creator Projects', value: 3400, suffix: '+' },
            { label: 'Hours Saved', value: 48000, suffix: '+' },
          ].map(({ label, value, suffix }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-white tabular-nums">
                <CountUp to={value} suffix={suffix} />
              </div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Feature Grid ─────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">Everything you need to go viral</h2>
          <p className="text-gray-400 mt-2 text-sm">A complete toolkit, built for modern YouTube creators.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard delay={2.8} icon={DocumentTextIcon} title="AI Script Generation" desc="Produce research-backed, engaging scripts in seconds using your topic or URL." />
          <FeatureCard delay={2.95} icon={FilmIcon} title="Scene Storyboarding" desc="Automatically split your script into visual scenes with AI image prompts." />
          <FeatureCard delay={3.1} icon={MicrophoneIcon} title="Voiceover Synthesis" desc="Generate natural-sounding voiceovers with waveform preview and download." />
          <FeatureCard delay={3.25} icon={DevicePhoneMobileIcon} title="Mobile Simulator" desc="Preview your app experience on any device, in portrait or landscape." />
          <FeatureCard delay={3.4} icon={LockClosedIcon} title="Secure Projects" desc="All scripts and scenes are saved to your account — always accessible." />
          <FeatureCard delay={3.55} icon={BoltIcon} title="Blazing Fast" desc="Powered by Mistral AI and FastAPI for near-instant generation results." />
        </div>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3.7 }}
        className="relative z-10 text-center py-8 text-xs text-gray-600 border-t border-white/5"
      >
        © {new Date().getFullYear()} Script Studio · Built for YouTube Creators
      </motion.footer>
    </div>
  );
};

export default LandingPage;
