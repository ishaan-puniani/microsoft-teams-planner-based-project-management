import { ISettings, ISettingsCreate, ISettingsUpdate, ISettingsFilter } from '../interfaces/settings/ISettings';

export type SettingsEntity = ISettings;
export type SettingsCreateData = ISettingsCreate;
export type SettingsUpdateData = ISettingsUpdate;
export type SettingsFilterData = ISettingsFilter;

export type ThemeType = 'light' | 'dark' | 'auto' | 'custom';

export type SettingsCategory = 'appearance' | 'notifications' | 'security' | 'privacy' | 'advanced';
