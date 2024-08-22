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
        width: 800,
        height: 600,
        wireframes: false,
        background: '#000'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Create the planet
const planet = Bodies.circle(400, 300, 50, { isStatic: true, render: { fillStyle: 'blue' } });
Composite.add(world, planet);

// Create the moons
const moon1 = Bodies.circle(300, 300, 20, { render: { fillStyle: 'gray' } });
const moon2 = Bodies.circle(500, 300, 20, { render: { fillStyle: 'gray' } });
Composite.add(world, [moon1, moon2]);

// Add constraints to make moons orbit the planet
const orbitRadius = 100;
const orbitSpeed = 0.02;

Events.on(engine, 'beforeUpdate', function() {
    Body.setPosition(moon1, {
        x: planet.position.x + orbitRadius * Math.cos(engine.timing.timestamp * orbitSpeed),
        y: planet.position.y + orbitRadius * Math.sin(engine.timing.timestamp * orbitSpeed)
    });
    Body.setPosition(moon2, {
        x: planet.position.x + orbitRadius * Math.cos(engine.timing.timestamp * orbitSpeed + Math.PI),
        y: planet.position.y + orbitRadius * Math.sin(engine.timing.timestamp * orbitSpeed + Math.PI)
    });
});

// Add meteor on button click
document.getElementById('addMeteor').addEventListener('click', function() {
    const meteor = Bodies.circle(Math.random() * 800, 0, 10, { render: { fillStyle: 'red' } });
    Body.setVelocity(meteor, { x: (400 - meteor.position.x) * 0.01, y: (300 - meteor.position.y) * 0.01 });
    Composite.add(world, meteor);
});

// Add stars to the background
const starCount = 100;
for (let i = 0; i < starCount; i++) {
    const star = Bodies.circle(Math.random() * 800, Math.random() * 600, 2, { isStatic: true, render: { fillStyle: 'white' } });
    Composite.add(world, star);
}