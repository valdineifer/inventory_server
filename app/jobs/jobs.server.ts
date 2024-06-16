import { CronJob } from 'cron';

const job = CronJob.from({
  cronTime: '*/1 0 0 * * *',
  onTick: () => {
    console.log('Running the cron job');
  },
  onComplete: () => {
    console.log('Cron job completed');
  },
});