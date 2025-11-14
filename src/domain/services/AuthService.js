import User from '../models/User.js';
import { SignUpValidator, SignInValidator } from '../validators/AuthValidator.js';
import { ValidationError } from '../errors/ValidationError.js';
import { InvalidCredentialsError, AuthenticationError } from '../errors/AuthError.js';

export class AuthService {
  constructor(supabaseClient, eventBus, logger) {
    this.supabase = supabaseClient;
    this.eventBus = eventBus;
    this.logger = logger.createChild({ context: 'AuthService' });
    this.currentUser = null;
    this.authListenerUnsubscribe = null;
  }

  async init() {
    try {
      // Verificar sesión existente
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        this.logger.error('Error checking session', error);
        return;
      }

      if (session) {
        this.#handleSignIn(session);
      }

      // Escuchar cambios de autenticación
      this.supabase.auth.onAuthStateChange((event, session) => {
        this.logger.debug('Auth state changed', { event });
        
        switch (event) {
          case 'SIGNED_IN':
            this.#handleSignIn(session);
            break;
          case 'SIGNED_OUT':
            this.#handleSignOut();
            break;
          case 'USER_UPDATED':
            this.#handleUserUpdate(session);
            break;
        }
      });

      this.logger.info('AuthService initialized');
    } catch (error) {
      this.logger.error('Failed to initialize AuthService', error);
      throw error;
    }
  }

  #setupAuthListener() {
    const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
      this.logger.debug('Auth state changed', { event });
      
      switch (event) {
        case 'SIGNED_IN':
          this.#handleSignIn(session);
          break;
        case 'SIGNED_OUT':
          this.#handleSignOut();
          break;
        case 'TOKEN_REFRESHED':
          this.logger.debug('Token refreshed');
          break;
        case 'USER_UPDATED':
          this.#handleUserUpdate(session);
          break;
      }
    });

    this.authListenerUnsubscribe = data.subscription.unsubscribe;
  }

  async #checkSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        this.#handleSignIn(session);
      }
      
      return session;
    } catch (error) {
      this.logger.error('Error checking session', error);
      return null;
    }
  }

  async signUp(signUpDTO) {
    this.logger.info('Signing up user', { email: signUpDTO.email });

    try {
      const validator = new SignUpValidator();
      if (!validator.validate(signUpDTO)) {
        throw new ValidationError(validator.getErrors());
      }

      const { data, error } = await this.supabase.auth.signUp({
        email: signUpDTO.email,
        password: signUpDTO.password,
        options: {
          data: {
            display_name: signUpDTO.displayName,
            role: 'presenter'  // ← CORREGIDO: 'presenter' por defecto
          }
        }
      });

      if (error) throw error;

      this.eventBus.emit('auth:signup', {
        user: data.user,
        session: data.session
      });

      this.logger.info('User signed up successfully', { email: signUpDTO.email });

      return {
        success: true,
        user: new User({
          id: data.user.id,
          email: data.user.email,
          display_name: data.user.user_metadata?.display_name,
          role: data.user.user_metadata?.role || 'presenter', // ← CORREGIDO
          metadata: data.user.user_metadata
        }).toDTO(),
        session: data.session
      };
    } catch (error) {
      this.logger.error('Sign up failed', error);

      if (error instanceof ValidationError) {
        throw error;
      }

      this.eventBus.emit('auth:error', {
        type: 'signup',
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async signIn(signInDTO) {
    this.logger.info('Signing in user', { email: signInDTO.email });

    try {
      const validator = new SignInValidator();
      if (!validator.validate(signInDTO)) {
        throw new ValidationError(validator.getErrors());
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: signInDTO.email,
        password: signInDTO.password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new InvalidCredentialsError();
        }
        throw error;
      }

      this.logger.info('User signed in successfully', { email: signInDTO.email });

      return {
        success: true,
        user: new User({
          id: data.user.id,
          email: data.user.email,
          display_name: data.user.user_metadata?.display_name,
          role: data.user.user_metadata?.role || 'presenter', // ← CORREGIDO
          metadata: data.user.user_metadata
        }).toDTO(),
        session: data.session
      };
    } catch (error) {
      this.logger.error('Sign in failed', error);

      if (error instanceof ValidationError || error instanceof InvalidCredentialsError) {
        throw error;
      }

      this.eventBus.emit('auth:error', {
        type: 'signin',
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  #handleSignIn(session) {
    if (!session?.user) return;

    const user = new User({
      id: session.user.id,
      email: session.user.email,
      display_name: session.user.user_metadata?.display_name || session.user.email.split('@')[0],
      role: session.user.user_metadata?.role || 'presenter', // Default to presenter
      metadata: session.user.user_metadata
    });

    this.currentUser = user;
    
    this.eventBus.emit('user:login', {
      user: user.toDTO(),
      session
    });

    this.logger.info('User logged in', { email: user.email });
  }

  #handleSignOut() {
    this.currentUser = null;
    this.eventBus.emit('user:logout', {});
    this.logger.info('User logged out');
  }

  #handleUserUpdate(session) {
    if (!session || !session.user) return;

    const user = new User({
      id: session.user.id,
      email: session.user.email,
      display_name: session.user.user_metadata?.display_name,
      role: session.user.user_metadata?.role || 'presenter', // ← CORREGIDO
      metadata: session.user.user_metadata
    });

    this.currentUser = user;
    
    this.eventBus.emit('user:updated', {
      user: user.toDTO()
    });
  }

  async signOut() {
    this.logger.info('Signing out user');

    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) throw error;

      this.logger.info('User signed out successfully');

      return { success: true };
    } catch (error) {
      this.logger.error('Sign out failed', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  getCurrentUser() {
    return this.currentUser ? this.currentUser.toDTO() : null;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getUserRole() {
    return this.currentUser?.role || null;
  }

  isPresenter() {
    return this.currentUser?.isPresenter() || false;
  }

  hasRole(role) {
    return this.currentUser?.hasRole(role) || false;
  }

  hasAnyRole(roles) {
    return this.currentUser?.hasAnyRole(roles) || false;
  }

  async updateProfile(updates) {
    this.logger.info('Updating user profile');

    try {
      const { data, error } = await this.supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      this.logger.info('Profile updated successfully');

      return {
        success: true,
        user: new User({
          id: data.user.id,
          email: data.user.email,
          ...data.user.user_metadata
        }).toDTO()
      };
    } catch (error) {
      this.logger.error('Failed to update profile', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async resetPassword(email) {
    this.logger.info('Requesting password reset', { email });

    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      this.logger.info('Password reset email sent', { email });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to send reset email', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async destroy() {
    if (this.authListenerUnsubscribe) {
      this.authListenerUnsubscribe();
    }
    this.currentUser = null;
    this.logger.info('AuthService destroyed');
  }
}

export default AuthService;