// Module aliases
const { Engine, Render, Runner, Bodies, Composite, Body, Events } = Matter;

// Create an engine
const engine = Engine.create();
const world = engine.world;

// Create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#000'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Make the canvas responsive
window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: window.innerWidth, y: window.innerHeight }
    });
});

// Create the sun
const sun = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 50, { isStatic: true, render: { fillStyle: 'yellow' } });
Composite.add(world, sun);

// Create the planets with elliptical orbits
const planets = [
    { name: 'Mercury', radius: 10, distance: 100, color: 'gray', orbitSpeed: 0.02, eccentricity: 0.2 },
    { name: 'Venus', radius: 15, distance: 150, color: 'orange', orbitSpeed: 0.015, eccentricity: 0.1 },
    { name: 'Earth', radius: 20, distance: 200, color: 'blue', orbitSpeed: 0.01, eccentricity: 0.0167 },
    { name: 'Mars', radius: 18, distance: 250, color: 'red', orbitSpeed: 0.008, eccentricity: 0.0934 },
    { name: 'Jupiter', radius: 30, distance: 350, color: 'brown', orbitSpeed: 0.005, eccentricity: 0.048 },
    { name: 'Saturn', radius: 28, distance: 450, color: 'yellow', orbitSpeed: 0.004, eccentricity: 0.056 },
    { name: 'Uranus', radius: 25, distance: 550, color: 'lightblue', orbitSpeed: 0.003, eccentricity: 0.046 },
    { name: 'Neptune', radius: 24, distance: 650, color: 'blue', orbitSpeed: 0.002, eccentricity: 0.009 }
];

planets.forEach(planet => {
    planet.body = Bodies.circle(sun.position.x + planet.distance, sun.position.y, planet.radius, { render: { fillStyle: planet.color } });
    Composite.add(world, planet.body);
});

// Update planet positions to follow elliptical orbits
Events.on(engine, 'beforeUpdate', function() {
    planets.forEach(planet => {
        const angle = engine.timing.timestamp * planet.orbitSpeed;
        const a = planet.distance;
        const b = a * Math.sqrt(1 - planet.eccentricity * planet.eccentricity);
        Body.setPosition(planet.body, {
            x: sun.position.x + a * Math.cos(angle),
            y: sun.position.y + b * Math.sin(angle)
        });
    });
});
