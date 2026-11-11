<script setup>
const retries = [
    { at: 'At once', title: 'First try' },
    { at: '1 minute later', title: 'Second try' },
    { at: '5 minutes later', title: 'Third try' },
    { at: '30 minutes later', title: 'Fourth try' },
    { at: '2 hours later', title: 'Fifth try' },
    { at: '6 hours later', title: 'Sixth try' },
    { at: '12 hours later', title: 'Last try' },
    { at: 'About 21 hours in all', title: 'Given up', text: 'After 10 deliveries in a row give up, the webhook is turned off.', tone: 'danger' },
];
const secrets = [
    { at: 'Make a new secret', title: 'Both secrets sign', text: 'Each message carries a signature from the old secret and one from the new.', tone: 'brand' },
    { at: '24 hours later', title: 'Only the new secret', text: 'The old secret stops being used.' },
];
</script>

# Webhooks

A webhook tells another service when something happens on your site. When a post goes live, a form is sent or someone signs up, Kestello sends a short message to an address you choose. Use it to rebuild a static site, post to a team chat through an automation tool, or copy new form answers into a spreadsheet.

You need the permission **Set up webhooks that send site events to other services**. Administrators have it.

## Add a webhook

The receiving service gives you an address to send to. It starts with `https://`.

![The Webhooks screen with Add webhook.](/screenshots/webhooks.png)

1. Go to **System → Webhooks** and click **Add webhook**.
2. Give it a **Name** you will recognise later, such as "Netlify rebuild".
3. Paste the **Address**.
4. Under **Events**, tick what it should hear about. **Everything** also includes events that plugins add later.
5. Click **Add webhook**. Kestello asks for your password if you have not entered it recently.
6. Copy the **signing secret** and give it to the receiving service. This is the only time it is shown.

You land on the webhook's page. Click **Send a test** to check that the service receives messages. The result appears straight away.

## What is sent

| Event | Sent when |
|---|---|
| An entry was created | Any page, post or other content is created, in any status. |
| An entry was saved | An existing entry is saved again. |
| An entry went live | An entry is published, or a scheduled one reaches its time. |
| An entry was moved to the trash | An entry is trashed. |
| An entry was submitted for review | A contributor submits an entry for review. |
| A form was submitted | A visitor sends a form. The answers are included. |
| A person got an account | An administrator adds someone, someone creates their own account by email, someone signs in with an outside account (such as Google) for the first time, or an account is made from the command line. |

Plugins can add their own events. They appear under the plugin's name in the list.

::: warning
Form answers and new accounts contain personal data such as names and email addresses. Only send them to services you trust with that data.
:::

## When a delivery fails

The service must answer within 10 seconds with a success code (200 to 299). If it does not, Kestello tries again after 1 minute, 5 minutes, 30 minutes, 2 hours, 6 hours and 12 hours, about 21 hours in all. An address that isn't allowed is not tried again, because nothing would change.

<Timeline :points="retries" caption="When a failed delivery is tried again" />

If 10 deliveries in a row give up, Kestello turns the webhook off and tells administrators by email and in the admin. Fix the receiving service, then open the webhook and click **Turn on again**.

The **Deliveries** list on the webhook's page shows every message from the last 30 days, what was sent and what the service answered. Click an event to see the details, and **Send again** to repeat a delivery.

## Change the signing secret

If the secret may have leaked, make a new one:

1. Open the webhook and click **Make a new secret**.
2. Copy the new secret and give it to the receiving service.

For the next 24 hours, messages are signed with both the old and the new secret, so nothing is missed while you switch.

<Timeline :points="secrets" caption="The old and the new secret, after Make a new secret" />

## If something goes wrong

- **"Use an https:// address"**: webhooks only go to secure addresses, so what is sent cannot be read on the way.
- **"This address is not allowed"**: the address points to your own server or a private network. Webhooks only go to public servers on the standard ports (80 and 443).
- **"Answered 301" or another 3xx**: the address redirects somewhere else. Kestello does not follow redirects. Use the final address instead.
- **"Answered 401" or "403"**: the service refused the message. Check that it has the current signing secret.

Developers building a receiver can read [Webhooks for developers](/developers/webhooks).
