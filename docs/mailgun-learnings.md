The key difference between sendTestEmail and sendCampaignEmail was in the domain construction. In the working version, we had:
,
But in the failing version, we were trying to be "smart" by removing potential duplicate "sandbox" prefixes:
,
Sometimes simpler is better - the original domain construction worked because:
If the domain already had "sandbox" prefix, adding another one didn't matter to Mailgun
The API was more concerned with the domain being properly formatted than with duplicate prefixes
Debugging lessons:
The error message "Unauthorized" from Mailgun was misleading - it wasn't about authentication but about malformed domain
Looking at working code vs non-working code side by side helped identify the difference
Adding detailed logging helped track the exact values being sent to the API
Best practice reinforced:
Don't try to be too clever with string manipulation when dealing with third-party APIs
When something works, be very careful about "improving" it
Keep implementations consistent across similar functions