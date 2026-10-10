export type PlatformAppConfig = {
  forceUpdate: boolean;
  latestVersion: string;
  minimumVersion: string;
  updateUrl: string;
};

export type BackendConfig = {
  baseUrl: string;
};

export type AppConfig = {
  android: PlatformAppConfig;
  ios: PlatformAppConfig;
  backend: BackendConfig;
  releasedAt: string | null;
  updateMessage: string;
  updateTitle: string;
};

export type AppConfigRow = {
  id: string;
  android_force_update: boolean;
  android_latest_version: string;
  android_minimum_version: string;
  android_update_url: string;
  ios_force_update: boolean;
  ios_latest_version: string;
  ios_minimum_version: string;
  ios_update_url: string;
  backend_base_url: string;
  released_at: string | null;
  update_message: string;
  update_title: string;
  created_at: string;
  updated_at: string;
};

export const APP_CONFIG_ID = 'default';

export const DEFAULT_APP_CONFIG: AppConfig = {
  android: {
    forceUpdate: false,
    latestVersion: '1.6.1',
    minimumVersion: '1.6.1',
    updateUrl: 'https://play.google.com/store/apps/details?id=com.kshitij_khowal.MetroConnect',
  },
  ios: {
    forceUpdate: false,
    latestVersion: '1.6.1',
    minimumVersion: '1.6.1',
    updateUrl: '',
  },
  backend: {
    baseUrl: 'https://metroconnectbackend.onrender.com',
  },
  releasedAt: null,
  updateMessage: 'A new version of MetroConnect is available with improvements and bug fixes.',
  updateTitle: 'Update Available',
};
