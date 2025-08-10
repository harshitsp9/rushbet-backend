import { EnvironmentTypes } from '@/types/types/envconfig.type';

const environment = {
  common: '.env',
};

// DON'T IMPORT ANYTHING HERE EXCEPT TYPES DUE TO ESM MODULES LIMITATION
const env = (): string => {
  return environment[environment.common as keyof EnvironmentTypes];
};

export default env;
