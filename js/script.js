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

// Create the planets with elliptical orbits and their moons
const planets = [
    { name: 'Mercury', radius: 10, distance: 100, color: 'gray', orbitSpeed: 0.002, eccentricity: 0.2, info: 'Mercury is the closest planet to the Sun and has a very thin atmosphere.' },
    { name: 'Venus', radius: 15, distance: 150, color: 'orange', orbitSpeed: 0.0015, eccentricity: 0.1, info: 'Venus is the hottest planet in our solar system due to its thick atmosphere.' },
    { name: 'Earth', radius: 20, distance: 200, color: 'blue', orbitSpeed: 0.001, eccentricity: 0.0167, info: 'Earth is the only planet known to support life.', moons: [{ name: 'Moon', radius: 5, distance: 30, color: 'white', orbitSpeed: 0.005 }] },
    { name: 'Mars', radius: 18, distance: 250, color: 'red', orbitSpeed: 0.0008, eccentricity: 0.0934, info: 'Mars is known as the Red Planet and has the largest volcano in the solar system.' },
    { name: 'Jupiter', radius: 30, distance: 350, color: 'brown', orbitSpeed: 0.0005, eccentricity: 0.048, info: 'Jupiter is the largest planet in our solar system and has a Great Red Spot.', moons: [{ name: 'Ganymede', radius: 8, distance: 40, color: 'gray', orbitSpeed: 0.003 }] },
    { name: 'Saturn', radius: 28, distance: 450, color: 'yellow', orbitSpeed: 0.0004, eccentricity: 0.056, info: 'Saturn is famous for its beautiful ring system.', moons: [{ name: 'Titan', radius: 7, distance: 50, color: 'orange', orbitSpeed: 0.002 }] },
    { name: 'Uranus', radius: 25, distance: 550, color: 'lightblue', orbitSpeed: 0.0003, eccentricity: 0.046, info: 'Uranus rotates on its side and has a faint ring system.' },
    { name: 'Neptune', radius: 24, distance: 650, color: 'blue', orbitSpeed: 0.0002, eccentricity: 0.009, info: 'Neptune is known for its strong winds and dark spots.', moons: [{ name: 'Triton', radius: 6, distance: 60, color: 'white', orbitSpeed: 0.001 }] }
];

planets.forEach(planet => {
    planet.body = Bodies.circle(sun.position.x + planet.distance, sun.position.y, planet.radius, { render: { fillStyle: planet.color } });
    Composite.add(world, planet.body);

    if (planet.moons) {
        planet.moons.forEach(moon => {
            moon.body = Bodies.circle(planet.body.position.x + moon.distance, planet.body.position.y, moon.radius, { render: { fillStyle: moon.color } });
            Composite.add(world, moon.body);
            moon.planet = planet;
        });
    }
});

// Update planet and moon positions to follow elliptical orbits
Events.on(engine, 'beforeUpdate', function() {
    planets.forEach(planet => {
        const angle = engine.timing.timestamp * planet.orbitSpeed;
        const a = planet.distance;
        const b = a * Math.sqrt(1 - planet.eccentricity * planet.eccentricity);
        Body.setPosition(planet.body, {
            x: sun.position.x + a * Math.cos(angle),
            y: sun.position.y + b * Math.sin(angle)
        });

        if (planet.moons) {
            planet.moons.forEach(moon => {
                const moonAngle = engine.timing.timestamp * moon.orbitSpeed;
                Body.setPosition(moon.body, {
                    x: planet.body.position.x + moon.distance * Math.cos(moonAngle),
                    y: planet.body.position.y + moon.distance * Math.sin(moonAngle)
                });
            });
        }
    });
});

// Focus on Earth initially
let currentFocus = 2; // Index of Earth in the planets array
function updateFocus() {
    const body = currentFocus === -1 ? sun : planets[currentFocus].body;
    const zoomOut = currentFocus === -1 ? 3 : 1;
    Render.lookAt(render, {
        min: { x: body.position.x - 200 * zoomOut, y: body.position.y - 200 * zoomOut },
        max: { x: body.position.x + 200 * zoomOut, y: body.position.y + 200 * zoomOut }
    });

    const planetName = currentFocus === -1 ? 'Sun' : planets[currentFocus].name;
    const planetInfo = currentFocus === -1 ? 'The Sun is the star at the center of our solar system.' : planets[currentFocus].info;
    document.getElementById('planetName').innerText = planetName;
    document.getElementById('planetInfo').innerText = planetInfo;

    // Position the info box to the right of the focused planet
    const infoBox = document.getElementById('info');
    infoBox.style.left = `${body.position.x + 100}px`;
    infoBox.style.top = `${body.position.y - 50}px`;
}

document.getElementById('prev').addEventListener('click', () => {
    currentFocus = (currentFocus - 1 + planets.length + 1) % (planets.length + 1) - 1;
    updateFocus();
});

document.getElementById('next').addEventListener('click', () => {
    currentFocus = (currentFocus + 1) % (planets.length + 1) - 1;
    updateFocus();
});

// Add event listeners for arrow keys
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        currentFocus = (currentFocus - 1 + planets.length + 1) % (planets.length + 1) - 1;
        updateFocus();
    } else if (event.key === 'ArrowRight') {
        currentFocus = (currentFocus + 1) % (planets.length + 1) - 1;
        updateFocus();
    }
});

// Initial focus on Earth
updateFocus();

// Follow the focused body
Events.on(engine, 'afterUpdate', function() {
    if (currentFocus !== -1) {
        const body = planets[currentFocus].body;
        Render.lookAt(render, {
            min: { x: body.position.x - 200, y: body.position.y - 200 },
            max: { x: body.position.x + 200, y: body.position.y + 200 }
        });

        // Update the position of the info box
        const infoBox = document.getElementById('info');
        infoBox.style.left = `${body.position.x + 100}px`;
        infoBox.style.top = `${body.position.y - 50}px`;
    }
});

// Add planetary trails
const trails = planets.map(() => []);

Events.on(engine, 'afterUpdate', function() {
    planets.forEach((planet, index) => {
        const trail = trails[index];
        trail.push({ x: planet.body.position.x, y: planet.body.position.y });
        if (trail.length > 100) {
            trail.shift();
        }
    });
});

function drawTrails() {
    const context = render.context;
    context.clearRect(0, 0, render.canvas.width, render.canvas.height);
    planets.forEach((planet, index) => {
        const trail = trails[index];
        context.beginPath();
        context.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
            context.lineTo(trail[i].x, trail[i].y);
        }
        context.strokeStyle = planet.color;
        context.stroke();
    });
}

Events.on(engine, 'afterRender', drawTrails);

// Add comet animation
function createComet() {
    const comet = Bodies.circle(-50, Math.random() * window.innerHeight, 5, {
        render: {
            fillStyle: 'white'
        }
    });
    Composite.add(world, comet);
    Body.setVelocity(comet, { x: 5, y: 0 });
    setTimeout(() => {
        Composite.remove(world, comet);
    }, 10000);
}

setInterval(createComet, 20000);

// Add planetary rotation
Events.on(engine, 'beforeUpdate', function() {
    planets.forEach(planet => {
        Body.rotate(planet.body, 0.01);
    });
});

// Ensure planets travel counter-clockwise and slower
Events.on(engine, 'beforeUpdate', function() {
    planets.forEach(planet => {
        const angle = engine.timing.timestamp * planet.orbitSpeed;
        const a = planet.distance;
        const b = a * Math.sqrt(1 - planet.eccentricity * planet.eccentricity);
        Body.setPosition(planet.body, {
            x: sun.position.x + a * Math.cos(angle),
            y: sun.position.y - b * Math.sin(angle) // Counter-clockwise direction
        });

        if (planet.moons) {
            planet.moons.forEach(moon => {
                const moonAngle = engine.timing.timestamp * moon.orbitSpeed;
                Body.setPosition(moon.body, {
                    x: planet.body.position.x + moon.distance * Math.cos(moonAngle),
                    y: planet.body.position.y - moon.distance * Math.sin(moonAngle) // Counter-clockwise direction
                });
            });
        }
    });
});