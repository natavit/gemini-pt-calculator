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
        id: 'gemini-3-pro-preview',
        name: 'Gemini 3 Pro',
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
        priceOutText: 12,
        priceOutImage: -1,
        priceOutVideo: -1,
        priceOutAudio: -1,

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
            priceOutImage: -1,
            priceOutVideo: -1,
            priceOutAudio: -1
        }
    },

    // --- GEMINI 3 Pro Image (Nano Banana Pro) ---
    {
        id: 'gemini-3-pro-image-preview',
        name: 'Gemini 3 Pro Image (Nano Banana Pro)',
        burnInText: 1.0,
        burnInImage: 1.0,
        burnInVideo: -1,
        burnInAudio: -1,
        burnOutText: 6.0,
        burnOutImage: 60, // N/A
        burnOutVideo: -1, // N/A
        burnOutAudio: -1, // N/A

        priceInText: 2,
        priceInImage: 2,
        priceInVideo: 2,
        priceInAudio: 2,
        priceOutText: 12,
        priceOutImage: 120,
        priceOutVideo: -1,
        priceOutAudio: -1,

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
            priceOutImage: 120,
            priceOutVideo: -1,
            priceOutAudio: -1
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
        burnOutVideo: -1,
        burnOutAudio: -1,

        priceInText: 1.25,
        priceInImage: 1.25,
        priceInVideo: 1.25,
        priceInAudio: 1.25,
        priceOutText: 10,
        priceOutImage: -1,
        priceOutVideo: -1,
        priceOutAudio: -1,

        gsuCapacity: 650, // Est

        longContextConfig: {
            threshold: 200000,
            burnInText: 2.0,
            burnInImage: 2.0,
            burnInVideo: 2.0,
            burnInAudio: 2.0,
            burnOutText: 12.0,
            burnOutImage: -1,
            burnOutVideo: -1,
            burnOutAudio: -1,

            priceInText: 2.50,
            priceInImage: 2.50,
            priceInVideo: 2.50,
            priceInAudio: 2.50,
            priceOutText: 15, // Adjusted to match user recent edit intent for long context? (User changed short to 10, long was 7.5->15 in recent edit)
            priceOutImage: -1,
            priceOutVideo: -1,
            priceOutAudio: -1
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
        burnOutImage: -1,
        burnOutVideo: -1,
        burnOutAudio: -1,

        priceInText: 0.30,
        priceInImage: 0.30,
        priceInVideo: 0.30,
        priceInAudio: 1,
        priceOutText: 2.5,
        priceOutImage: -1,
        priceOutVideo: -1,
        priceOutAudio: -1,

        gsuCapacity: 2690,

        longContextConfig: {
            threshold: 200000,
            burnInText: 1.0,
            burnInImage: 1.0,
            burnInVideo: 1.0,
            burnInAudio: 4.0,
            burnOutText: 9.0,
            burnOutImage: -1,
            burnOutVideo: -1,
            burnOutAudio: -1,

            priceInText: 0.30,
            priceInImage: 0.30,
            priceInVideo: 0.30,
            priceInAudio: 1,
            priceOutText: 2.5,
            priceOutImage: -1,
            priceOutVideo: -1,
            priceOutAudio: -1
        }
    },
    {
        id: 'gemini-2-5-flash-image',
        name: 'Gemini 2.5 Flash (Nano Banana)',
        burnInText: 1.0,
        burnInImage: 1.0,
        burnInVideo: 1.0,
        burnInAudio: 4.0, // Special rate!
        burnOutText: 9.0, // High output burn!
        burnOutImage: 100,
        burnOutVideo: -1,
        burnOutAudio: -1,

        priceInText: 0.30,
        priceInImage: 0.30,
        priceInVideo: 0.30,
        priceInAudio: 1,
        priceOutText: 2.5,
        priceOutImage: 30,
        priceOutVideo: -1,
        priceOutAudio: -1,

        gsuCapacity: 2690,

        longContextConfig: {
            threshold: 200000,
            burnInText: 1.0,
            burnInImage: 1.0,
            burnInVideo: 1.0,
            burnInAudio: 4.0,
            burnOutText: 9.0,
            burnOutImage: 100,
            burnOutVideo: -1,
            burnOutAudio: -1,

            priceInText: 0.30,
            priceInImage: 0.30,
            priceInVideo: 0.30,
            priceInAudio: 1,
            priceOutText: 2.5,
            priceOutImage: 30,
            priceOutVideo: -1,
            priceOutAudio: -1
        }
    }
];

export const DEFAULT_MODEL_ID = 'gemini-3-pro-preview';

export const PT_PRICING = {
    MONTHLY: 2700,
    QUARTERLY: 2400,
    YEARLY: 2000
};
