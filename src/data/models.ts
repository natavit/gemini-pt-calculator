export interface ModelConstraints {
    id: string;
    name: string;
    // Detailed Input Burndown (Multipliers)
    burnInText: number;
    burnInImage: number;
    burnInVideo: number;
    burnInAudio: number;
    // Detailed Output Burndown
    burnOutText: number;
    burnOutImage: number; // usually N/A or specific
    burnOutVideo: number; // usually N/A
    burnOutAudio: number; // usually N/A

    paygoInputPrice: number;
    paygoOutputPrice: number;
    gsuCapacity: number;

    // Optional override for Long Context
    longContextConfig?: {
        threshold: number; // e.g. 200000
        burnInText: number;
        burnInImage: number;
        burnInVideo: number;
        burnInAudio: number;
        burnOutText: number;
        burnOutImage: number;
        burnOutVideo: number;
        burnOutAudio: number;
        paygoInputPrice: number;
        paygoOutputPrice: number;
    }
}

export const GEMINI_MODELS: ModelConstraints[] = [
    // --- GEMINI 3.0 ---
    {
        id: 'gemini-3-pro',
        name: 'Gemini 3.0 Pro',
        burnInText: 1.0,
        burnInImage: 1.0,
        burnInVideo: 1.0,
        burnInAudio: 1.0,
        burnOutText: 6.0,
        burnOutImage: 1, // N/A
        burnOutVideo: 1, // N/A
        burnOutAudio: 1, // N/A

        paygoInputPrice: 2, // Placeholder/Est
        paygoOutputPrice: 12, // Placeholder/Est
        gsuCapacity: 500, // Est

        longContextConfig: {
            threshold: 200000,
            burnInText: 2.0,
            burnInImage: 2.0,
            burnInVideo: 2.0,
            burnInAudio: 2.0,
            burnOutText: 9.0,
            burnOutImage: 1,
            burnOutVideo: 1,
            burnOutAudio: 1,
            paygoInputPrice: 4,
            paygoOutputPrice: 12
        }
    },

    // --- GEMINI 2.5 ---
    {
        id: 'gemini-2-5-pro',
        name: 'Gemini 2.5 Pro',
        burnInText: 1.0,
        burnInImage: 1.0,
        burnInVideo: 1.0,
        burnInAudio: 1.0,
        burnOutText: 8.0,
        burnOutImage: 1,
        burnOutVideo: 1,
        burnOutAudio: 1,

        paygoInputPrice: 1.25,
        paygoOutputPrice: 3.75,
        gsuCapacity: 200, // Est

        longContextConfig: {
            threshold: 200000,
            burnInText: 2.0,
            burnInImage: 2.0,
            burnInVideo: 2.0,
            burnInAudio: 2.0,
            burnOutText: 12.0,
            burnOutImage: 1,
            burnOutVideo: 1,
            burnOutAudio: 1,
            paygoInputPrice: 2.50,
            paygoOutputPrice: 7.50
        }
    },
    {
        id: 'gemini-2-5-flash',
        name: 'Gemini 2.5 Flash',
        burnInText: 1.0,
        burnInImage: 1.0,
        burnInVideo: 1.0,
        burnInAudio: 4.0, // Special rate!
        burnOutText: 9.0, // High output burn!
        burnOutImage: 1,
        burnOutVideo: 1,
        burnOutAudio: 1,

        paygoInputPrice: 0.075,
        paygoOutputPrice: 0.30,
        gsuCapacity: 1000 // Est
    },
    {
        id: 'gemini-2-5-flash-image',
        name: 'Gemini 2.5 Flash (Image Gen)',
        burnInText: 1.0,
        burnInImage: 1.0,
        burnInVideo: 1.0,
        burnInAudio: 1.0,
        burnOutText: 9.0,
        burnOutImage: 100.0, // High image output burn!
        burnOutVideo: 1,
        burnOutAudio: 1,

        paygoInputPrice: 0.10, // Est
        paygoOutputPrice: 0.40,
        gsuCapacity: 1000
    }
];

export const DEFAULT_MODEL_ID = 'gemini-3-pro';

export const PT_PRICING = {
    MONTHLY: 2700,
    QUARTERLY: 2400,
    YEARLY: 2000
};
