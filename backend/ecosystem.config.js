// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: './.env.deploy' });

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REF = 'origin/main',
} = process.env;

module.exports = {
  apps: [
    {
      name: 'kupipodariday-back',
      script: './dist/main.js',
    },
  ],
  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      key: '~/.ssh/id_ed25519',
      repo: 'git@github.com:Aria1ink/kupipodariday-backend.git',
      path: DEPLOY_PATH,
      'pre-deploy-local': `scp ./.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/source`,
      'post-deploy': `npm i && npm run build`,
    },
  },
};
