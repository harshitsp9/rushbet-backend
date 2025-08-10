import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
  ignores: [(commitMessage) => commitMessage.startsWith('chore(release): :bookmark: bump version')],
};

export default Configuration;

/* 
these are prefix for commit
build;
chore;
ci;
docs;
feat;
fix;
perf;
refactor;
revert;
style;
test;

*/
