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
        jest.clearAllMocks();
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                authenticated: true,
                role: "CUSTOMER",
                accountHref: "/user/settings",
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
        expect(screen.getAllByText("Account")[0]).toHaveAttribute("href", "/user/settings");
    });

    it("routes drivers to their profile and portal instead of customer ordering", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                authenticated: true,
                role: "DRIVER",
                accountHref: "/driver/dashboard/account",
            }),
        }) as jest.Mock;

        render(<SiteHeader />);

        await waitFor(() => {
            expect(screen.getAllByText("Driver Profile").length).toBeGreaterThan(0);
        });

        expect(screen.queryByText("Order now")).not.toBeInTheDocument();
        expect(screen.getAllByText("Driver Profile")[0]).toHaveAttribute("href", "/driver/dashboard/account");
        expect(screen.getAllByText("Driver Portal")[0]).toHaveAttribute("href", "/driver/dashboard");
    });
});
