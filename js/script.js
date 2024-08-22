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

// Create the sun
const sun = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 50, { isStatic: true, render: { fillStyle: 'yellow' } });
Composite.add(world, sun);

// Create the planets
const planet1 = Bodies.circle(sun.position.x + 150, sun.position.y, 20, { render: { fillStyle: 'blue' } });
const planet2 = Bodies.circle(sun.position.x + 300, sun.position.y, 30, { render: { fillStyle: 'green' } });
const planet3 = Bodies.circle(sun.position.x + 450, sun.position.y, 25, { render: { fillStyle: 'red' } });
Composite.add(world, [planet1, planet2, planet3]);

// Create the moon for the second planet
const moon = Bodies.circle(planet2.position.x + 50, planet2.position.y, 10, { render: { fillStyle: 'gray' } });
Composite.add(world, moon);

// Add constraints to make planets and moon orbit
const orbitRadius1 = 150;
const orbitRadius2 = 300;
const orbitRadius3 = 450;
const moonOrbitRadius = 50;
const orbitSpeed1 = 0.01;
const orbitSpeed2 = 0.005;
const orbitSpeed3 = 0.003;
const moonOrbitSpeed = 0.02;

Events.on(engine, 'beforeUpdate', function() {
    Body.setPosition(planet1, {
        x: sun.position.x + orbitRadius1 * Math.cos(engine.timing.timestamp * orbitSpeed1),
        y: sun.position.y + orbitRadius1 * Math.sin(engine.timing.timestamp * orbitSpeed1)
    });
    Body.setPosition(planet2, {
        x: sun.position.x + orbitRadius2 * Math.cos(engine.timing.timestamp * orbitSpeed2),
        y: sun.position.y + orbitRadius2 * Math.sin(engine.timing.timestamp * orbitSpeed2)
    });
    Body.setPosition(planet3, {
        x: sun.position.x + orbitRadius3 * Math.cos(engine.timing.timestamp * orbitSpeed3),
        y: sun.position.y + orbitRadius3 * Math.sin(engine.timing.timestamp * orbitSpeed3)
    });
    Body.setPosition(moon, {
        x: planet2.position.x + moonOrbitRadius * Math.cos(engine.timing.timestamp * moonOrbitSpeed),
        y: planet2.position.y + moonOrbitRadius * Math.sin(engine.timing.timestamp * moonOrbitSpeed)
    });
});

// Add meteor on button click
document.getElementById('addMeteor').addEventListener('click', function() {
    const meteor = Bodies.circle(Math.random() * window.innerWidth, 0, 10, { render: { fillStyle: 'red' } });
    Body.setVelocity(meteor, { x: (sun.position.x - meteor.position.x) * 0.01, y: (sun.position.y - meteor.position.y) * 0.01 });
    Composite.add(world, meteor);
});

// Apply gravity to meteors
Events.on(engine, 'beforeUpdate', function() {
    Composite.allBodies(world).forEach(body => {
        if (body !== sun && body !== planet1 && body !== planet2 && body !== planet3 && body !== moon) {
            const dx = sun.position.x - body.position.x;
            const dy = sun.position.y - body.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceMagnitude = (0.001 * sun.mass * body.mass) / (distance * distance);
            const force = {
                x: (forceMagnitude * dx) / distance,
                y: (forceMagnitude * dy) / distance
            };
            Body.applyForce(body, body.position, force);
        }
    });
});