export type Stat = {
    value: number;
    locked: boolean;
};

export type Character = {
    name: string;
    class: string;
    level: number;
    origin: string;
    domain: string;
    stats: {
        AGILITY: Stat;
        STRENGTH: Stat;
        FINESSE: Stat;
        INSTINCT: Stat;
        PRESENCE: Stat;
        KNOWLEDGE: Stat;
    };
    evasion: { value: number, locked: boolean };
    armor: {
        max: number;
        locked: boolean;
        slots: { used: boolean, locked: boolean }[];
    };
};