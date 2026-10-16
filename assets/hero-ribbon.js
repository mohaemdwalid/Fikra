(() => {
  'use strict';
  const hero = document.querySelector('#home.editorial-hero');
  if (!hero || hero.querySelector('.hero-ribbon-canvas')) return;
  // Ribbon Field export: angle 32, scale 68, softness 24, wave 14, grain 42.
  // Exported feather stops bake in stripe positions 18 / 57 / 60 / 100.
  const settings = Object.freeze({angle: 32, wave: 14, grain: 42, seed: 174074637,
    speed: 1, motionAmount: 0, direction: 1, initialClock: 20.75});
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-ribbon-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';
  const gl = canvas.getContext('webgl', {alpha: false, antialias: false, depth: false, powerPreference: 'low-power'});
  if (!gl) return; // The CSS export remains as the no-WebGL/no-JS fallback.
  function shader(type, source) {
    const result = gl.createShader(type); gl.shaderSource(result, source); gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) { gl.deleteShader(result); return null; }
    return result;
  }
  const vertex = shader(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){gl_Position=vec4(p,0.,1.);}');
  const fragment = shader(gl.FRAGMENT_SHADER, `
    precision highp float;
    uniform vec2 size;
    uniform float angle, clock, wave, grain, seed;
    float noise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+seed)*43758.5453);}
    void main(){
      vec2 p=gl_FragCoord.xy-size*.5;
      float a=radians(angle);
      vec2 axis=vec2(sin(a),cos(a)), across=vec2(cos(a),-sin(a));
      float alongSpan=dot(abs(axis),size);
      float crossSpan=dot(abs(across),size);
      float cross=dot(p,across)/crossSpan+.5;
      float t=dot(p,axis)/alongSpan+.5;
      t+=(wave/100.)*.35*sin(cross*2.4*6.28318530718+clock);
      vec3 white=vec3(1.), sky=vec3(120.,184.,249.)/255.;
      vec3 ultra=vec3(86.,103.,255.)/255., iris=vec3(77.,47.,249.)/255.;
      vec3 color=mix(white,sky,clamp((t-.3318)/(.3786-.3318),0.,1.));
      color=mix(color,ultra,clamp((t-.5814)/(.5886-.5814),0.,1.));
      color=mix(color,iris,clamp((t-.7964)/(.8-.7964),0.,1.));
      // Seeded, stationary bitmap grain, using overlay blend at export opacity .210.
      float n=noise(gl_FragCoord.xy);
      vec3 overlay=mix(2.*color*n,1.-2.*(1.-color)*(1.-n),step(vec3(.5),color));
      color=mix(color,overlay,grain/100.*.5);
      gl_FragColor=vec4(color,1.);
    }`);
  if (!vertex || !fragment) return;
  const program = gl.createProgram(); gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries(['size','angle','clock','wave','grain','seed'].map(name => [name, gl.getUniformLocation(program, name)]));
  hero.prepend(canvas);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, elapsed = 0, previous = null, onScreen = true, lost = false;
  function draw(t) {
    const ph = t * settings.speed, spin = ph * settings.direction;
    // amt=0: only the wave clock advances. The angle modulation starts at exactly zero.
    gl.uniform2f(uniforms.size, canvas.width, canvas.height);
    gl.uniform1f(uniforms.angle, settings.angle + Math.sin(spin * .6) * 28 * settings.motionAmount);
    gl.uniform1f(uniforms.clock, settings.initialClock + ph * 1.2);
    gl.uniform1f(uniforms.wave, settings.wave); gl.uniform1f(uniforms.grain, settings.grain);
    gl.uniform1f(uniforms.seed, settings.seed % 10000);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function tick(now) {
    frame = 0;
    if (previous !== null) elapsed += (now - previous) / 1000;
    previous = now; draw(elapsed); frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previous = null;
    if (lost) return;
    if (reduced.matches) draw(0);
    else if (onScreen && !document.hidden) frame = requestAnimationFrame(tick);
  }
  const resize = new ResizeObserver(() => {
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(hero.clientWidth * ratio));
    canvas.height = Math.max(1, Math.floor(hero.clientHeight * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height); draw(reduced.matches ? 0 : elapsed);
  });
  resize.observe(hero);
  const visibility = new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; sync(); });
  visibility.observe(hero);
  document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', sync);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; sync(); canvas.hidden = true; });
  draw(0); sync();
})();
