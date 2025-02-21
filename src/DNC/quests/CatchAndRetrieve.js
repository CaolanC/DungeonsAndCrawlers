export default {
    namespace: "DNC",
    name: "CatchAndRetrieve",
    dialogue: {
        introduction: "Hell",
        pitch: "",
        accept: "",
        decline: "",
        greeting: "",
        success: ""
    },
    stages: {
        1: () => {
            return {
                description: "Will you fetch my block of grass?",
                options: {
                    "Decline Quest" : 1
                    "Accept Quest" : 2,
                }
            }
        },
        2: () => {
            console.log("We've started the quest!");
        },
        3: () => {
            console.log("We've completed the quest!!!");
        }
    },
};
