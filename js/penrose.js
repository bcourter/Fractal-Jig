var renderer, camera, settings, materials, bodyGeometry, lightGeometry;

init();
animate();

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(5, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 70;

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    window.addEventListener( 'resize', onWindowResize, false );

    var Settings = function () {
        this.isRotatingCheckbox = document.getElementById("isRotating");
        this.isAnimatingCheckbox = document.getElementById("isAnimating");
    };

    materials = [
        new THREE.MeshLambertMaterial( {
            color: 0x222222,
            side: THREE.DoubleSide,
            shading: THREE.FlatShading,
            transparent: true,
            opacity: 0.5
        } ),
        new THREE.MeshBasicMaterial( {
            color: 0xEEEEEE,
            shading: THREE.FlatShading,
            wireframe: true
        } )
    ];


    var loader = new THREE.OBJLoader();
    loader.addEventListener( 'load', function ( event ) {
        bodyGeometry = event.content;
    });

    loader.load( "resources/obj/jig.obj" );

    settings = new Settings();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate, renderer.domElement );

    render();
    controls.update();
    //stats.update();
}

function recurse(depth, object) {

    var obj = object.clone();
    var obj2 = object.clone();

    obj.applyMatrix(new THREE.Matrix4().identity().rotateY(-Math.PI * 11 / 12).rotateZ(-Math.PI / 12));
    obj.scale = new THREE.Vector3(0.6, 0.7, 0.6);
    obj.translateX(0.8);
    obj.translateZ(-0.5);

    obj.translateY(0.6);
    object.add(obj);

    obj2.applyMatrix(new THREE.Matrix4().identity().rotateY(-Math.PI * 11 / 12).rotateZ(Math.PI / 12));
    obj2.scale = new THREE.Vector3(0.6, 0.7, 0.6);
    obj2.translateX(0.8);
    obj2.translateZ(-0.5);

    obj2.translateY(-0.6);
    object.add(obj2);



    if (depth == 0)
        return;

    recurse(depth - 1, object);
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
    var triangle = new THREE.Object3D();

    if (bodyGeometry === undefined)
        return;

    var geometry = bodyGeometry.clone();
    triangle.add(geometry);
    recurse(5, triangle);

    triangle.applyMatrix(new THREE.Matrix4().identity()
                         .rotateZ(Math.PI / 2)
                         .rotateY(0.1 * lastRotation)
                         );

    var scale = 0.5;
    triangle.scale.set(scale, scale, scale);
    scene.add(triangle);

    var ambientLight = new THREE.AmbientLight(0x666666);
    scene.add(ambientLight);

    scene.fog = new THREE.Fog( 0x333333, 1500, 2100 );

    var directionalLight = new THREE.DirectionalLight(0x8888aa);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    var directionalLight = new THREE.DirectionalLight(0x8888aa);
    directionalLight.position.set(-1, -1, -1).normalize();
    scene.add(directionalLight);

    renderer.render( scene, camera );
}
