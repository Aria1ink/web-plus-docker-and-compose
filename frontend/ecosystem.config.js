// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: './.env.deploy' });

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REF = 'origin/main',
} = process.env;

module.exports = {
  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      key: '~/.ssh/id_ed25519',
      repo: 'git@github.com:Aria1ink/kupipodariday-frontend.git',
      path: DEPLOY_PATH,
      'post-deploy': 'npm i && npm run build'
    },
  },
};
