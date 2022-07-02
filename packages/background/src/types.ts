export type Background = {
  _serverUi: Handle;
  _solanaConnection: Handle;
  _serverInjected?: Handle;
};

export type Config = {
  isMobile: boolean;
};

// Opaque handle.
export type Handle = any;
