'use client';

import { ReactNode, useEffect, useState } from 'react';
import { asyncWithLDProvider } from 'launchdarkly-react-client-sdk';

export default function LaunchDarklyClientProvider({ children }: { children: ReactNode }) {
    const [LDProvider, setLDProvider] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const provider = await asyncWithLDProvider({
                clientSideID: process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_SIDE_ID || '',
                user: {
                    kind: 'user',
                    key: 'anonymous-user',
                    anonymous: true
                },
                options: {
                    bootstrap: 'localStorage',
                },
            });
            setLDProvider(() => provider);
        })();
    }, []);

    if (!LDProvider) {
        // Fallback or loading state while LD initializes
        return <>{children}</>;
    }

    return <LDProvider>{children}</LDProvider>;
}
