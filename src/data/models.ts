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

    // Detailed PayGo Pricing (Per 1 Million Units)
    priceInText: number;
    priceInImage: number;
    priceInVideo: number;
    priceInAudio: number;

    priceOutText: number;
    priceOutImage: number;
    priceOutVideo: number;
    priceOutAudio: number;

    gsuCapacity: number;

    // Optional override for Long Context
    longContextConfig?: {
        threshold: number;
        burnInText: number;
        burnInImage: number;
        burnInVideo: number;
        burnInAudio: number;
        burnOutText: number;
        burnOutImage: number;
        burnOutVideo: number;
        burnOutAudio: number;

        // Granular Pricing Overrides
        priceInText: number;
        priceInImage: number;
        priceInVideo: number;
        priceInAudio: number;
        priceOutText: number;
        priceOutImage: number;
        priceOutVideo: number;
        priceOutAudio: number;
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

        priceInText: 2,
        priceInImage: 2,
        priceInVideo: 2,
        priceInAudio: 2,
        priceOutText: 18,
        priceOutImage: 18,
        priceOutVideo: 18,
        priceOutAudio: 18,

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

            priceInText: 4,
            priceInImage: 4,
            priceInVideo: 4,
            priceInAudio: 4,
            priceOutText: 18,
            priceOutImage: 18,
            priceOutVideo: 18,
            priceOutAudio: 18
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

        priceInText: 1.25,
        priceInImage: 1.25,
        priceInVideo: 1.25,
        priceInAudio: 1.25,
        priceOutText: 10,
        priceOutImage: 10,
        priceOutVideo: 10,
        priceOutAudio: 10,

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

            priceInText: 2.50,
            priceInImage: 2.50,
            priceInVideo: 2.50,
            priceInAudio: 2.50,
            priceOutText: 15, // Adjusted to match user recent edit intent for long context? (User changed short to 10, long was 7.5->15 in recent edit)
            priceOutImage: 15,
            priceOutVideo: 15,
            priceOutAudio: 15
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

        priceInText: 0.075,
        priceInImage: 0.075,
        priceInVideo: 0.075,
        priceInAudio: 0.075,
        priceOutText: 0.30,
        priceOutImage: 0.30,
        priceOutVideo: 0.30,
        priceOutAudio: 0.30,

        gsuCapacity: 1000
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

        priceInText: 0.10,
        priceInImage: 0.10,
        priceInVideo: 0.10,
        priceInAudio: 0.10,
        priceOutText: 0.40,
        priceOutImage: 0.40,
        priceOutVideo: 0.40,
        priceOutAudio: 0.40,
        gsuCapacity: 1000
    }
];

export const DEFAULT_MODEL_ID = 'gemini-3-pro';

export const PT_PRICING = {
    MONTHLY: 2700,
    QUARTERLY: 2400,
    YEARLY: 2000
};
