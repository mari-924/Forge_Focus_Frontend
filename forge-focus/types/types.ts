export interface GoogleUser {
  id: string;
  name: string | null;
  email: string;
  photo?: string | null;
  givenName?: string | null;
  familyName?: string | null;
}
  
// export interface GitHubUser {
//   id: string;          // GitHub numeric id as string
//   login: string;       // username
//   name: string | null; // display name
//   avatar_url?: string | null;
//   email?: string | null; // sometimes null if private
// }
  

export interface User {
  id: number;
  googleId: string | null;
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
