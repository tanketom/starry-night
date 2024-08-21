// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a black starry background
scene.background = new THREE.Color(0x000000);
const starsGeometry = new THREE.BufferGeometry();
const starVertices = [];
for (let i = 0; i < 10000; i++) {
    starVertices.push((Math.random() - 0.5) * 2000);
    starVertices.push((Math.random() - 0.5) * 2000);
    starVertices.push((Math.random() - 0.5) * 2000);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0x888888 });
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// Create the blue sphere (planet)
const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
const planetMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);

// Create the moons
const moonGeometry = new THREE.SphereGeometry(1, 32, 32);
const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const moon1 = new THREE.Mesh(moonGeometry, moonMaterial);
const moon2 = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon1);
scene.add(moon2);

// Position the camera
camera.position.z = 20;

// Set up Matter.js physics engine
const engine = Matter.Engine.create();
const world = engine.world;

// Create Matter.js bodies for the planet and moons
const planetBody = Matter.Bodies.circle(0, 0, 5, { isStatic: true });
const moon1Body = Matter.Bodies.circle(10, 0, 1);
const moon2Body = Matter.Bodies.circle(-10, 0, 1);
Matter.World.add(world, [planetBody, moon1Body, moon2Body]);

// Add gravitational force between the planet and moons
Matter.Events.on(engine, 'beforeUpdate', function() {
    Matter.Body.applyForce(moon1Body, moon1Body.position, {
        x: (planetBody.position.x - moon1Body.position.x) * 0.0001,
        y: (planetBody.position.y - moon1Body.position.y) * 0.0001
    });
    Matter.Body.applyForce(moon2Body, moon2Body.position, {
        x: (planetBody.position.x - moon2Body.position.x) * 0.0001,
        y: (planetBody.position.y - moon2Body.position.y) * 0.0001
    });
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update Matter.js engine
    Matter.Engine.update(engine);

    // Sync Three.js objects with Matter.js bodies
    moon1.position.set(moon1Body.position.x, moon1Body.position.y, 0);
    moon2.position.set(moon2Body.position.x, moon2Body.position.y, 0);

    // Rotate the moons around their own axis
    moon1.rotation.y += 0.01;
    moon2.rotation.y += 0.01;

    renderer.render(scene, camera);
}
animate();
