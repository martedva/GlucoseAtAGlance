interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    uiLanguage: string;
    communicationLanguage: string;
    accountType: string;
    uom: string;
    dateFormat: string;
    timeFormat: string;
    emailDay: number | null;
    system: {
        messages: {
            appReviewBanner: number;
            firstUsePhoenix: number;
            firstUsePhoenixReportsDataMerged: number;
            lluGettingStartedBanner: number;
            lluNewFeatureModal: number;
            streamingTourMandatory: number;
        };
    };
    details: Record<string, unknown>;
    twoFactor: {
        primaryMethod: string;
        primaryValue: string;
        secondaryMethod: string;
        secondaryValue: string;
    };
    created: number;
    lastLogin: number;
    programs: Record<string, unknown>;
    dateOfBirth: number;
    practices: Record<string, {
        id: string;
        practiceId: string;
        name: string;
        address1: string;
        city: string;
        state: string;
        zip: string;
        phoneNumber: string;
        records: unknown;
    }>;
    devices: Record<string, {
        id: string;
        nickname: string;
        sn: string;
        type: number;
        uploadDate: number;
    }>;
    consents: {
        realWorldEvidence: {
            policyAccept: number;
            touAccept: number;
            history: {
                policyAccept: number;
            }[];
        };
    };
};

export default User;