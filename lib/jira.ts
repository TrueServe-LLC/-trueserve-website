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

export async function createJiraIssue(summary: string, description: string): Promise<string | null> {
    const domain = process.env.JIRA_DOMAIN || 'lcking992.atlassian.net';
    const email = process.env.JIRA_USER_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const projectKey = process.env.JIRA_PROJECT_KEY || 'TS'; // Fallback to 'TS' if not set

    if (!email || !token) {
        console.warn("[Jira API] Missing JIRA_USER_EMAIL or JIRA_API_TOKEN. Skipping issue creation.");
        return null;
    }

    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    
    try {
        const response = await fetch(`https://${domain}/rest/api/3/issue`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    project: { key: projectKey },
                    summary: summary,
                    issuetype: { name: "Task" }, // Using standard "Task", assuming it exists
                    description: {
                        type: "doc",
                        version: 1,
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        text: description,
                                        type: "text"
                                    }
                                ]
                            }
                        ]
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Jira API] Failed to create issue: ${response.status} ${errorText}`);
            return null;
        }

        const data = await response.json();
        console.log(`[Jira API] Successfully created issue: ${data.key}`);
        return data.key;
    } catch (error) {
        console.error("[Jira API Error]:", error);
        return null;
    }
}
