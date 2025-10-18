export const ENVIRONMENTS = {
  TEST: 'test',
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

export const getCurrentEnvironment = (): Environment => {
  return (process.env.NODE_ENV as Environment) || ENVIRONMENTS.DEVELOPMENT;
};

export const isTestEnvironment = (): boolean => {
  return getCurrentEnvironment() === ENVIRONMENTS.TEST;
};

export const isProductionEnvironment = (): boolean => {
  return getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION;
};

export const isDevelopmentEnvironment = (): boolean => {
  return getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT;
};
