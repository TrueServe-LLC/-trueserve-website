/**
 * Jira API Utility
 * Used for "Talking Back" to Jira to confirm actions.
 */

export async function postJiraComment(issueKey: string, message: string) {
    const domain = process.env.JIRA_DOMAIN || 'lcking992.atlassian.net';
    const email = process.env.JIRA_USER_EMAIL;
    const token = process.env.JIRA_API_TOKEN;

    if (!email || !token) {
        console.warn("[Jira API] Missing JIRA_USER_EMAIL or JIRA_API_TOKEN. Skipping comment.");
        return;
    }

    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    
    try {
        const response = await fetch(`https://${domain}/rest/api/3/issue/${issueKey}/comment`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                body: {
                    type: "doc",
                    version: 1,
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    text: message,
                                    type: "text"
                                }
                            ]
                        }
                    ]
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Jira API] Failed to post comment: ${response.status} ${errorText}`);
        } else {
            console.log(`[Jira API] Successfully posted comment to ${issueKey}`);
        }
    } catch (error) {
        console.error("[Jira API Error]:", error);
    }
}
