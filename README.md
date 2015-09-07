# threejs-particle-shader


This project offers an configurable and easy way to integrate a shader based particle system into a THREE.js project.  
Basically it's a rewrite of my experimental particle shaders. I cleaned the code, added configurable options and wrapped everything in a small and reusable lib.

This project is WIP!

[View Demo](http://pwambach.github.io/threejs-particle-shader/)

Inspired by the ["One Million Particles"](https://www.chromeexperiments.com/experiment/one-million-particles) Chrome Experiment

## Usage


1. Load the script from the dist folder
```
<script src="dist/particles.js"></script>
```

2. Create a particle system. This function expects your THREE.js WebGL renderer and the rendered scene. Optionally you can customize the particle system by providing an options object.
```
var particles = new Particles(renderer, scene, options);
```

3. To animate the particles you have to update the particles in your render loop.
```
particles.update();
```

## Options

* __textureSize__
Integer *(Default: 256)*: Sets the size of the particle shader textures resulting in the number of rendered particles. So 256 for example means there will be 256*256=65536 particles.

* __pointSize__
Float *(Default: 1.0)*: The size of a single particle (the gl_PointSize value for the display shader)

* __gravityFactor__
Float *(Default: 1.0)*: Gravity Factor for the default particle movement. In case you change the default behaviour using the *velocityFunctionString* this variable can be used as a custom input value.

* __explodeRate__
Float *(Default: 1.0)*: The intensity of the initial random velocity and position spread

* __targetPosition__
THREE.Vector3 *(Default: (0,0,0))*: The position of the gravity center for the default particle movement. You can also use this value for custom movements. Have a look at example 4.

* __targetPosition__
THREE.DataTexture *(Default: null)*: With a targetTexture you can specify a targetPosition for each particle. Have a look at example 3 for how to create a targetTexture.

* __velocityFunctionString__
String *(Default: null)*: The velocityFunctionString enables to change the default behaviour of the velocity fragment shader. If it is specified the original code of the shader will be replaced with the defined string.
The value has to be valid GLSL code and should set the variable ```outVelocity``` as a vec3. Currently these values are available for calculations: ```inVelocity, inPosition, targetPos, dist, direction``` (with ```dist``` beeing the distance from the particle to the ```targetPos``` and ```direction``` the normalized direction pointing from the particle to the ```targetPos```). If you specify a ```targetTexture```, the ```targetPos``` will not be the targetPosition from ```options.targetPosition``` but the position for this specific particle defined in the targetTexture.

* __positionFunctionString__
String *(Default: null)*: The positionFunctionString works in the same way. The string value will be set in the position fragment shader. ```pos``` should be set as a vec3. For now the only input variable is: ```velocity```

* __colorFunctionString__
String *(Default: null)*: The colorFunctionString works in the same way. The string value will be set in the displays fragment shader. ```color``` should be set as a ```vec4```. For now the only input variables are: ```dist, alpha```
