export default {
    name: "Sand",
    id: 4,
    mod_namespace: "DNC",
    client: {
        properties: {
            texture: "textures/stone.png",
        },
    },
    server: {
        properties: {
            isSolid: true,
            isBreakable: true,
        },
    },
};

// TODO: During registration time, we need to create a map for unique ID's of blocks for the server's use, to a way for clients and users to identify blocks "DNC:stone" for example is mapped to an abstract id decided by the system
