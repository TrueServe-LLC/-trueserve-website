import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SiteHeader from "@/components/SiteHeader";

const unsubscribe = jest.fn();

jest.mock("next/navigation", () => ({
    usePathname: () => "/",
}));

jest.mock("next/link", () => {
    return ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={String(href)} {...props}>{children}</a>
    );
});

jest.mock("@/components/Logo", () => {
    return function MockLogo() {
        return <span>TrueServe</span>;
    };
});

jest.mock("@/lib/supabase", () => ({
    supabase: {
        auth: {
            onAuthStateChange: jest.fn(() => ({
                data: { subscription: { unsubscribe } },
            })),
        },
    },
}));

describe("SiteHeader", () => {
    beforeEach(() => {
        unsubscribe.mockClear();
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                authenticated: true,
                accountHref: "/admin/dashboard",
            }),
        }) as jest.Mock;
    });

    it("uses the server cookie session for authenticated header actions", async () => {
        render(<SiteHeader />);

        await waitFor(() => {
            expect(screen.getAllByText("Account").length).toBeGreaterThan(0);
        });

        expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
        expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
        expect(screen.getAllByText("Order now").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Account")[0]).toHaveAttribute("href", "/admin/dashboard");
    });
});
