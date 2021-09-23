export enum AppType {
    Whisper = 'whisper',
    Glass = 'glass',
    Forum = 'forum',
    Quantum = 'quantum',
    Meetings = 'meetings',
    Kutana = 'kutana',
}

export interface AppItemType {
    name: AppType;
    icon: string;
    enabled: boolean;
}
