// Create SNS Topic for game events
export const gameEventsTopic = new sst.aws.SnsTopic("GameEvents");

// Correct setup for SQS Queues
export const gameStateQueue = new sst.aws.Queue("GameStateQueue");
export const tournamentQueue = new sst.aws.Queue("TournamentQueue");
export const analyticsQueue = new sst.aws.Queue("AnalyticsQueue");
export const notificationQueue = new sst.aws.Queue("NotificationQueue");

// Subscribe Lambda functions to queues
gameStateQueue.subscribe("packages/functions/src/events/game-state.handler");
tournamentQueue.subscribe("packages/functions/src/events/tournament.handler");
analyticsQueue.subscribe("packages/functions/src/events/analytics.handler");
notificationQueue.subscribe(
  "packages/functions/src/events/notification.handler"
);

// Subscribe queues to the topic
gameEventsTopic.subscribeQueue("GameStateSubscriber", gameStateQueue);
gameEventsTopic.subscribeQueue("TournamentSubscriber", tournamentQueue);
gameEventsTopic.subscribeQueue("AnalyticsSubscriber", analyticsQueue);
gameEventsTopic.subscribeQueue("NotificationSubscriber", notificationQueue);
