interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          auto_select?: boolean;
          context?: string;
          ux_mode?: 'popup' | 'redirect';
          login_uri?: string;
          native_callback?: (response: { credential: string }) => void;
          prompt_parent_id?: string;
          state_cookie_domain?: string;
          cancel_on_tap_outside?: boolean;
          hosted_domain?: string;
        }) => void;
        renderButton: (
          element: HTMLElement | null,
          options: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            width?: number | string;
            type?: 'standard' | 'icon';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            logo_alignment?: 'left' | 'center';
            locale?: string;
          }
        ) => void;
        prompt: () => void;
        disableAutoSelect: () => void;
        storeCredential: (credential: { id: string; password: string }, callback?: () => void) => void;
        cancel: () => void;
        revoke: (accessToken: string, callback: () => void) => void;
      };
    };
  };
} 