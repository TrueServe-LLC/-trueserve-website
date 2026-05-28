import Link from "next/link";
import Logo from "@/components/Logo";

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 8h4V23h-4V8Zm7.5 0h3.83v2.05h.05c.53-1.01 1.84-2.08 3.79-2.08 4.05 0 4.8 2.67 4.8 6.14V23h-4v-7.88c0-1.88-.03-4.29-2.61-4.29-2.62 0-3.02 2.04-3.02 4.15V23H8V8Z" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="ts-fig-footer">
      <div className="ts-fig-container">
        <div className="ts-fig-footer-grid">
          <div className="ts-fig-footer-brand">
            <Logo size="sm" />
            <p>Your neighborhood, delivered.</p>
            <div className="ts-fig-footer-social" aria-label="Social links">
              <a href="https://www.linkedin.com/company/truesrve/" aria-label="TrueServe on LinkedIn" target="_blank" rel="noreferrer">
                <LinkedInIcon />
              </a>
            </div>
          </div>
          <div className="ts-fig-footer-col">
            <h4>Get Started</h4>
            <ul>
              <li><Link href="/restaurants">Order Food</Link></li>
              <li><Link href="/signup">Sign Up</Link></li>
              <li><Link href="/about">Download App</Link></li>
              <li><Link href="/rewards">Rewards</Link></li>
            </ul>
          </div>
          <div className="ts-fig-footer-col">
            <h4>Partners</h4>
            <ul>
              <li><Link href="/merchant">Become a Restaurant Partner</Link></li>
              <li><Link href="/drive">Become a Driver</Link></li>
              <li><Link href="/merchant">Business Accounts</Link></li>
            </ul>
          </div>
          <div className="ts-fig-footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link href="/contact">Help Center</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/orders">Track Order</Link></li>
              <li><Link href="/contact">FAQs</Link></li>
            </ul>
          </div>
        </div>
        <div className="ts-fig-footer-bottom">
          <span>© {new Date().getFullYear()} TrueServe. All rights reserved.</span>
          <div className="ts-fig-footer-bottom-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
