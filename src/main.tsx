import { Devvit } from '@devvit/public-api';

Devvit.configure({ redditAPI: true });

Devvit.addMenuItem({
  label: 'New Orbit Switch Game',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();
    await context.reddit.submitPost({
      subredditName: subreddit.name,
      title: 'Orbit Switch',
      preview: (
        <blocks height="tall">
          <vstack alignment="center middle" height="100%">
            <text>Loading…</text>
          </vstack>
        </blocks>
      ),
    });
    context.ui.showToast('Game created!');
  },
});

Devvit.addCustomPostType({
  name: 'Orbit Switch',
  render: (_context) => {
    return (
      <blocks height="tall">
        <vstack alignment="center middle" height="100%">
          <text size="xxlarge" weight="bold">Orbit Switch</text>
          <text color="neutral-content-weak">Puzzle coming soon</text>
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;
