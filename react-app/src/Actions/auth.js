import { sessionService } from 'redux-react-session';

export const login = (user) => {
  const { token } = user;
  sessionService.saveSession({ token }).then(() => sessionService.saveUser(user));
}