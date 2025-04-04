import { Transaction } from "@/schemas/transactionSchema";

export const generateSecondTagChartData = (transactions: Transaction[]): { name: string; value: number }[] => {
    const secondTagData: Record<string, number> = {};
    transactions.forEach(({ tags, value }) => {
        if (tags.length > 1) {
            const secondTag = tags[1];
            // Round value to 2 decimal places to avoid float precision issues
            secondTagData[secondTag] = (secondTagData[secondTag] || 0) + Math.round(-value * 100) / 100;
        }
    });
    return Object.entries(secondTagData).map(([name, value]) => ({ name, value }));
};

export const generateTreemapData = (transactions: Transaction[]): any[] => {
    const map: Record<string, { name: string; value: number; children: { name: string; value: number }[] }> = {};
    transactions.forEach(({ tags, name, value }) => {
        tags.forEach(tag => {
            if (!map[tag]) map[tag] = { name: tag, value: 0, children: [] };
            map[tag].children.push({ name, value: -value });
            map[tag].value += -value;
        });
    });
    return Object.values(map);
};