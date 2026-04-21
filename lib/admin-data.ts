import { isProductionEnvironment } from "./environment";

type AdminUserLike = {
    email?: string | null;
    name?: string | null;
    role?: string | null;
    isMock?: boolean | null;
};

const MOCK_USER_PATTERNS = [
    /(^|\b)(mock|demo|test|seed|sandbox|preview)(\b|$)/i,
    /\.test$/i,
    /@.*\.(test|invalid)$/i,
];

export function isMockAdminRecord(record?: AdminUserLike | null): boolean {
    if (!record) return false;
    if (record.isMock) return true;

    const combinedText = [record.email, record.name].filter(Boolean).join(" ");
    return MOCK_USER_PATTERNS.some((pattern) => pattern.test(combinedText));
}

export function shouldHideMockAdminData(): boolean {
    return isProductionEnvironment();
}

export function filterAdminUsers<T extends AdminUserLike>(records: T[]): T[] {
    if (!shouldHideMockAdminData()) return records;
    return records.filter((record) => !isMockAdminRecord(record));
}
