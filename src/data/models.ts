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
}

export const GEMINI_MODELS: ModelConstraints[] = [
    {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        burnInText: 1.0,
        burnInImage: 258,
        burnInVideo: 258, // per second? assuming 1 sec video ≈ 258 tokens for simplicity or user enters 'seconds of video'
        burnInAudio: 32, // per second
        burnOutText: 4.0,
        burnOutImage: 1, // Placeholder
        burnOutVideo: 1, // Placeholder
        burnOutAudio: 1, // Placeholder

        paygoInputPrice: 0.075,
        paygoOutputPrice: 0.30,
        gsuCapacity: 2000
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        burnInText: 1.0,
        burnInImage: 258,
        burnInVideo: 258,
        burnInAudio: 32,
        burnOutText: 4.0,
        burnOutImage: 1,
        burnOutVideo: 1,
        burnOutAudio: 1,

        paygoInputPrice: 3.50,
        paygoOutputPrice: 10.50,
        gsuCapacity: 200
    },
    {
        id: 'gemini-3',
        name: 'Gemini 3.0',
        burnInText: 1.0,
        burnInImage: 300,
        burnInVideo: 300,
        burnInAudio: 40,
        burnOutText: 6.0,
        burnOutImage: 1,
        burnOutVideo: 1,
        burnOutAudio: 1,

        paygoInputPrice: 2.00,
        paygoOutputPrice: 12.00,
        gsuCapacity: 500
    }
];

export const DEFAULT_MODEL_ID = 'gemini-3';

export const PT_PRICING = {
    MONTHLY: 2700,
    QUARTERLY: 2400,
    YEARLY: 2000
};
