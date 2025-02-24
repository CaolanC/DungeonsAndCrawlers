export class Sky {
    
    constructor(scene, sky_color, vert, frag) {
        this.geometry = new THREE.SphereGeometry(50, 32, 32);
        this.vertex_shader = this.#getShaderCode(vert);
        this.fragment_shader = this.#getShaderCode(frag);
        this.scene = scene;
        this.sky_color = sky_color;
        this.#init();
    }

    #init() {
        this.geometry.scale(-1, 1, 1);

        this.material = new THREE.ShaderMaterial({
            vertexShader: this.vertex_shader,
            fragmentShader: this.fragment_shader,
            uniforms: {
                skyColor: this.sky_color,
            },
            side: THREE.BackSide,
            depthWrite: false
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        //this.scene.add(this.mesh);
    }

    async #getShaderCode(name) {
        try {
            const res = await fetch(`shaders/${name}`);
            return res.text();
        } catch (e) {
            console.error("Sky, Shader code malformed?:", e);
        }
    }
}
