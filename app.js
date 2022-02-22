// Require the Bolt package (github.com/slackapi/bolt)
const { App, LogLevel, ExpressReceiver } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// All the room in the world for your code

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("You360 app is running!");
})();

// subscribe to 'app_mention' event in your App config
// need app_mentions:read and chat:write scopes

app.event("app_mention", async ({ event, client }) => {
  try {
    // directly call the api method 'chat.postMessage'
    const result = await client.chat.postMessage({
      channel: event.channel,
      text: `Thanks for the mention, <@${event.user}>!`,
    });
  } catch (error) {
    console.error(error);
  }
});

app.event("app_home_opened", async ({ event, client, context }) => {
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await client.views.publish({
      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
        type: "home",
        callback_id: "home_view",

        /* body of the view */
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Welcome to your _App's Home_* :tada:",
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "This button won't do much for now but you can set up a listener for it using the `actions()` method and passing its unique `action_id`. See an example in the `examples` folder within your Bolt app.",
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Click me!",
                },
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});

// subscribe to `message.channels` event in your App Config
// need channels:history scope
app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  // no need to directly use 'chat.postMessage', no need to include token
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Thanks for the mention <@${message.user}>! Click my fancy button`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Button",
            emoji: true,
          },
          value: "click_me_123",
          action_id: "first_button",
        },
      },
    ],
  });
});

// // Listen and respond to button click
app.action("first_button", async ({ action, ack, say }) => {
  // acknowledge the request right away
  await ack();
  await say("Thanks for clicking the fancy button");
});

app.message('knock knock', async ({ message, say }) => {
  await say(`_Who's there?_`);
});

app.message(/^(hi|hello|hey|:wave:).*/, async ({ context, say }) => {
  // RegExp matches are inside of context.matches
  const greeting = context.matches[0];

  await say(`<@${context.matches[0]}>, how are you?`);
});

// Listen for a slash command invocation
app.command('/ticket', async ({ ack, body, client, logger }) => {
  // Acknowledge the command request
  await ack();

  try {
    // Call views.open with the built-in client
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Modal title'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Welcome to a modal with _blocks_'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'input_c',
            label: {
              type: 'plain_text',
              text: 'What are your hopes and dreams?'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'dreamy_input',
              multiline: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

// Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
app.action('button_abc', async ({ ack, body, client, logger }) => {
  // Acknowledge the button request
  await ack();

  try {
    // Call views.update with the built-in client
    const result = await client.views.update({
      // Pass the view_id
      view_id: body.view.id,
      // Pass the current hash to avoid race conditions
      hash: body.view.hash,
      // View payload with updated blocks
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Updated modal'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'You updated the modal!'
            }
          },
          {
            type: 'image',
            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
            alt_text: 'Yay! The modal was updated'
          }
        ]
      }
    });
    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});


// Listen for users opening your App Home
app.event('app_home_opened', async ({ event, client, logger }) => {
  try {
    // Call views.publish with the built-in client
    const result = await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: {
        // Home tabs must be enabled in your app configuration page under "App Home"
        "type": "home",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Welcome home, <@" + event.user + "> :house:*"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Learn how home tabs can be more useful and interactive <https://api.slack.com/surfaces/tabs/using|*in the documentation*>."
            }
          }
        ]
      }
    });

    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

app.command('/mirror', async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack();

  await respond(`${command.text}`);
});

// // setup shortcut in your App config page
// // add commands permission
// app.shortcut("launch_my_summary", async ({ shortcut, ack, client }) => {
//   try {
//     // Acknowledge shortcut request
//     await ack();

//     // Call the views.open method using one of the built-in WebClients
//     const result = await client.views.open({
//       // The token you used to initialize your app is stored in the `context` object
//       trigger_id: shortcut.trigger_id,
//       view: {
//         type: "modal",
//         title: {
//           type: "plain_text",
//           text: "My App",
//         },
//         close: {
//           type: "plain_text",
//           text: "Close",
//         },
//         blocks: [
//           {
//             type: "section",
//             text: {
//               type: "mrkdwn",
//               text: "About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>.",
//             },
//           },
//           {
//             type: "context",
//             elements: [
//               {
//                 type: "mrkdwn",
//                 text: "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>",
//               },
//             ],
//           },
//         ],
//       },
//     });
//   } catch (error) {
//     console.error(error);
//   }
// });

// // Listen for a slash command invocation
app.command("/u360", async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    const result = await app.client.chat.postMessage({
      token: context.botToken,
      // Channel to send message to
      channel: payload.channel_id,
    
        type: "modal",
        title: {
          type: "plain_text",
          text: "My App",
          emoji: true,
        },
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Hi David :wave:",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Great to see you here! App helps you to stay up-to-date with your meetings and events right here within Slack. These are just a few things which you will be able to do:",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "• Schedule meetings \n • Manage and update attendees \n • Get notified about changes of your meetings",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "But before you can do all these amazing things, we need you to connect your calendar to App. Simply click the button below:",
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Connect account",
                  emoji: true,
                },
                value: "click_me_123",
              },
            ],
          },
          {
            type: "input",
            element: {
              type: "timepicker",
              initial_time: "13:37",
              placeholder: {
                type: "plain_text",
                text: "Select time",
                emoji: true,
              },
              action_id: "timepicker-action",
            },
            label: {
              type: "plain_text",
              text: "Label",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Test block with multi conversations select",
            },
            accessory: {
              type: "multi_conversations_select",
              placeholder: {
                type: "plain_text",
                text: "Select conversations",
                emoji: true,
              },
              action_id: "multi_conversations_select-action",
            },
          },
        ],
      }
    );
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

// // Listen for a button invocation with action_id `button_abc`
// // You must set up a Request URL under Interactive Components on your app configuration page
app.action("button_abc", async ({ ack, body, context }) => {
  // Acknowledge the button request
  ack();

  try {
    // Update the message
    const result = await app.client.chat.update({
      token: context.botToken,
      // ts of message to update
      ts: body.message.ts,
      // Channel of message
      channel: body.channel.id,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*The button was clicked!*",
          },
        },
      ],
      text: "Message from Test App",
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

// // Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
// // You must set up a Request URL under Interactive Components on your app configuration page
// app.action("button_abc", async ({ ack, body, context }) => {
//   // Acknowledge the button request
//   ack();

//   try {
//     const result = await app.client.views.update({
//       token: context.botToken,
//       // Pass the view_id
//       view_id: body.view.id,
//       // View payload with updated blocks
//       view: {
//         type: "modal",
//         // View identifier
//         callback_id: "view_1",
//         title: {
//           type: "plain_text",
//           text: "Updated modal",
//         },
//         blocks: [
//           {
//             type: "section",
//             text: {
//               type: "plain_text",
//               text: "You updated the modal!",
//             },
//           },
//           {
//             type: "image",
//             image_url:
//               "https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif",
//             alt_text: "Yay! The modal was updated",
//           },
//         ],
//       },
//     });
//     console.log(result);
//   } catch (error) {
//     console.error(error);
//   }
// });
