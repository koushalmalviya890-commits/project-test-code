export interface StartupProfile {
  startupName: string | null;
  logoUrl: string | null;
}

export interface ServiceProviderProfile {
  serviceName: string | null;
  logoUrl: string | null;
}

export type Profile = StartupProfile | ServiceProviderProfile | null;

export default Profile;
