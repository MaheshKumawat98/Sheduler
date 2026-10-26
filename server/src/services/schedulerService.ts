import cron from 'node-cron';
import Post from '../models/Post';
import Account from '../models/Account';
import ActivityLog from '../models/ActivityLog';
import zerno from '../config/zerno';

/**
 * Initializes background cron scheduler to check and publish due posts every minute
 */
export const initScheduler = (): void => {
  cron.schedule('* * * * *', async () => {
    try {
      // STEP 1 — Find due posts
      const duePosts = await Post.find({
        status: 'scheduled',
        scheduledFor: { $lte: new Date() },
      });

      if (duePosts.length === 0) {
        return;
      }

      console.log(`[Scheduler] Found ${duePosts.length} due post(s) to publish.`);

      for (const post of duePosts) {
        try {
          // STEP 2 — Find connected Accounts for post's user and platforms
          const userAccounts = await Account.find({
            user: post.user,
            status: 'connected',
            zernoAccountId: { $exists: true, $ne: '' },
          });

          const matchedPlatforms: Array<{ platform: string; accountId: string }> = [];

          for (const targetPlatform of post.platforms) {
            const acc = userAccounts.find(
              (a) => a.platform.toLowerCase() === targetPlatform.toLowerCase()
            );
            if (acc && acc.zernoAccountId) {
              matchedPlatforms.push({
                platform: acc.platform.toLowerCase(),
                accountId: acc.zernoAccountId,
              });
            }
          }

          // STEP 3 — If no matching accounts found, skip post without changing status
          if (matchedPlatforms.length === 0) {
            console.warn(
              `[Scheduler] No connected accounts found for post ${post._id} across platforms [${post.platforms.join(', ')}]. Skipping.`
            );
            continue;
          }

          // STEP 4 — Build Zerno publishing payload
          const payload: any = {
            content: post.content,
            publish: true,
            publishNow: true,
            platforms: matchedPlatforms,
            ...(post.mediaUrl
              ? {
                  mediaUrl: post.mediaUrl,
                  mediaItems: [
                    {
                      url: post.mediaUrl,
                      type: post.mediaType || 'image',
                    },
                  ],
                }
              : {}),
          };

          // STEP 5 — Call zerno.posts.createPost() with payload
          const result = await (zerno.posts.createPost as any)({
            body: payload,
            ...payload,
          });

          if (result && result.error) {
            throw new Error(
              typeof result.error === 'string'
                ? result.error
                : result.error.message || 'Zerno publishing error'
            );
          }

          // STEP 6 — On success
          post.status = 'published';
          await post.save();

          await ActivityLog.create({
            user: post.user,
            actionType: 'post_published',
            description: `Post published to ${post.platforms.join(', ')}`,
            relatedPost: post._id,
            platform: post.platforms.join(', '),
          });

          console.log(`[Scheduler] Post ${post._id} successfully published.`);
        } catch (postError) {
          // STEP 7 — On failure
          post.status = 'failed';
          await post.save();
          console.error(`[Scheduler] Error publishing post ${post._id}:`, postError);
        }
      }
    } catch (cronError) {
      console.error('[Scheduler] Error executing background scheduler cron job:', cronError);
    }
  });

  console.log('[Scheduler] Background scheduler initialized (* * * * *).');
};

export default initScheduler;
