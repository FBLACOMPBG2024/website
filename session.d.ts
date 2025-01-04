import 'iron-session';

declare module 'iron-session' {
  interface IronSessionData {
    user?: {
        _id: string;
        email: string;
        
    };
  }
}
