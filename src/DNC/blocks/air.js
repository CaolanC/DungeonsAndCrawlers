export default {
    name: "Air",
    mod_namespace: "DNC",
    client: {
        properties: {
            texture: null, // Air has no texture.
        },
    },
    server: {
        properties: {
            isSolid: false,
            isBreakable: false,
        },
    },
};

// TODO: Expand on our blocks, refine the properties and implement a registry system for the frontend and backend as well as shared components. Add a solid block, skip direct registry for now, get them sent to our frontned.
