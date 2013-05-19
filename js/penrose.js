var renderer, camera, settings, materials, jigMeshOriginal, lightGeometry;

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
        document.getElementById("saveObj").onclick = saveObj;
    };

    var loader = new THREE.OBJLoader();
    loader.addEventListener('load', function (event) {
        jigMeshOriginal = event.content.children[0].children[0];
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
var jigMesh;
function render() {
    var time = new Date().getTime() / 1000;
    if (settings.isAnimatingCheckbox.checked)
        lastAnimation += time - lastTime;

    if (settings.isRotatingCheckbox.checked)
        lastRotation += time - lastTime;

    lastTime = time;

    if (jigMeshOriginal === undefined)
        return;

    var scene = new THREE.Scene();
    var geometry = jigMeshOriginal.geometry.clone();

    var faceIndices = ['a', 'b', 'c', 'd'];
    var color, f, p, n, vertexIndex;

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

    jigMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: THREE.VertexColors }));
    scene.add(jigMesh);

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

function saveObj() {
    var mesh = jigMesh;
    var op = THREE.saveGeometryToObj(mesh);

    var newWindow = window.open("");
    newWindow.document.write(
          op );
}

THREE.saveGeometryToObj = function (geo) {
    var nums = geo.length;
    geo.updateMatrixWorld();
    var s = '';

    for (i = 0; i < geo.geometry.vertices.length; i++) {
        var vector = new THREE.Vector3(geo.geometry.vertices[i].x, geo.geometry.vertices[i].y, geo.geometry.vertices[i].z);
        geo.matrixWorld.multiplyVector3(vector);

        s += 'v ' + (vector.x) + ' ' +
        vector.y + ' ' +
        vector.z + '<br />';
    }

    for (i = 0; i < geo.geometry.faces.length; i++) {
        s += 'f ' +
            (geo.geometry.faces[i].a + 1) + ' ' +
            (geo.geometry.faces[i].b + 1) + ' ' +
            (geo.geometry.faces[i].c + 1)
        ;

        if (geo.geometry.faces[i].d !== undefined) {
            s += ' ' + (geo.geometry.faces[i].d + 1);
        }
        s += '<br />';
    }

    return s;
}