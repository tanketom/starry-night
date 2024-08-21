// Module aliases
const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body;

// Create an engine
const engine = Engine.create();

// Create a renderer
const render = Render.create({
    element: document.body,
    canvas: document.getElementById('world'),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#000'
    }
});

// Create the planet and moons
const planet = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 100, {
    isStatic: true,
    render: {
        fillStyle: 'blue'
    }
});

const moon1 = Bodies.circle(window.innerWidth / 2 + 200, window.innerHeight / 2, 30, {
    render: {
        fillStyle: 'gray'
    }
});

const moon2 = Bodies.circle(window.innerWidth / 2 - 200, window.innerHeight / 2, 30, {
    render: {
        fillStyle: 'gray'
    }
});

// Add all of the bodies to the world
World.add(engine.world, [planet, moon1, moon2]);

// Run the engine
Engine.run(engine);

// Run the renderer
Render.run(render);

// Function to update moon positions
function updateMoons() {
    const time = Date.now() * 0.001;
    Body.setPosition(moon1, {
        x: window.innerWidth / 2 + 200 * Math.cos(time),
        y: window.innerHeight / 2 + 200 * Math.sin(time)
    });
    Body.setPosition(moon2, {
        x: window.innerWidth / 2 + 200 * Math.cos(time + Math.PI),
        y: window.innerHeight / 2 + 200 * Math.sin(time + Math.PI)
    });
    requestAnimationFrame(updateMoons);
}

updateMoons();
