var renderer, camera, settings, materials, bodyGeometry, lightGeometry;

init();
animate();

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(5, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 70;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);

    window.addEventListener('resize', onWindowResize, false);

    var Settings = function () {
        this.isRotatingCheckbox = document.getElementById("isRotating");
        this.isAnimatingCheckbox = document.getElementById("isAnimating");
    };

    materials = [
        new THREE.MeshLambertMaterial({
            color: 0x222222,
            side: THREE.DoubleSide,
            shading: THREE.FlatShading,
            transparent: true,
            opacity: 0.5
        }),
        new THREE.MeshBasicMaterial({
            color: 0xEEEEEE,
            shading: THREE.FlatShading,
            wireframe: true
        })
    ];


    var loader = new THREE.OBJLoader();
    loader.addEventListener('load', function (event) {
        bodyGeometry = event.content;
    });

    loader.load("resources/obj/jig.obj");

    settings = new Settings();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate, renderer.domElement);

    render();
    controls.update();
    //stats.update();
}

var lastTime = 0, lastAnimation = 0, lastRotation = 0;
function render() {
    var time = new Date().getTime() / 1000;
    if (settings.isAnimatingCheckbox.checked)
        lastAnimation += time - lastTime;

    if (settings.isRotatingCheckbox.checked)
        lastRotation += time - lastTime;

    lastTime = time;

    var scene = new THREE.Scene();

    if (bodyGeometry === undefined)
        return;

    var jig = bodyGeometry.clone();

    jig.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            var faceIndices = ['a', 'b', 'c', 'd'];
            var color, f, p, n, vertexIndex;
            geometry = child.geometry;

            for (var i = 0; i < geometry.faces.length; i++) {
                f = geometry.faces[i];
                n = (f instanceof THREE.Face3) ? 3 : 4;

                for (var j = 0; j < n; j++) {
                    vertexIndex = f[faceIndices[j]];

                    p = geometry.vertices[vertexIndex].clone();
                    var speed = 4;
                    var scale = 0.1;
                    geometry.vertices[vertexIndex] = geometry.vertices[vertexIndex].add((new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(scale)));

                    color = new THREE.Color(0xffffff);


                    var amplitude = 0.4;
                    var gain = 0.6;
                    p = p.addScalar((lastAnimation * speed) % Math.PI);

                    var r = Math.sin(p.x) * Math.cos(p.y) * amplitude + gain;
                    var g = Math.sin(p.y) * Math.cos(p.z) * amplitude + gain;
                    var b = Math.sin(p.z) * Math.cos(p.x) * amplitude + gain;

                    color.setRGB(r, g, b);
                    f.vertexColors[j] = color;
                }
            }

            geometry.colorsNeedUpdate = true;

            child.material = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: THREE.VertexColors });
        }

    });

    scene.add(jig);

    var ambientLight = new THREE.AmbientLight(0x666666);
    scene.add(ambientLight);

    scene.fog = new THREE.Fog(0x333333, 1500, 2100);

    var directionalLight = new THREE.DirectionalLight(0x8888aa);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    var directionalLight = new THREE.DirectionalLight(0x8888aa);
    directionalLight.position.set(-1, -1, -1).normalize();
    scene.add(directionalLight);

    renderer.render(scene, camera);
}
