export interface GoogleUser {
    id: string;
    name: string;
    givenName?: string;
    familyName?: string;
    email: string;
    photo?: string | null | undefined;
  }
  

  
  export interface User {
    id: number;
    g_id: string;
    username: string;
    email: string;
    profile_pic: string | null;
  }
  
  export type NewUser = Omit<User, "id">;
  export interface Profile {
    user_id: number;
    age: number;
    weight: number;
    height: number;
    skill_level?: string;
  }
  
  export type RootStackParamList = {
    Home: undefined;
    FocusSession: { duration: number };
    Profile: undefined;
    Login: undefined;
    Signup: undefined;
    Settings: undefined;
  };
