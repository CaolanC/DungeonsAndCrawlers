vec3 calculateLighting(vec3 normal) {
    return normalize(normal) * 0.5 + 0.5;
}
