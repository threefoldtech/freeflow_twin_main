export enum AppType {
    Whisper = 'whisper',
    Glass = 'glass',
    Forum = 'forum',
    Quantum = 'quantum',
    Meetings = 'meetings',
    Kutana = 'kutana',
    Dashboard = 'dashboard',
}

export interface AppItemType {
    name: AppType | string;
    icon: string;
    enabled: boolean;
    value: AppType;
}
