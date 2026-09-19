import { useMemo, useState } from 'react';

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default function useMonthNavigator(initialDate = new Date()) {
    const [month, setMonth] = useState(() => startOfMonth(initialDate));

    const range = useMemo(() => {
        const from = startOfMonth(month);
        const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        return { from: toDateString(from), to: toDateString(to) };
    }, [month]);

    function goToPreviousMonth() {
        setMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1));
    }

    function goToNextMonth() {
        setMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1));
    }

    return { month, range, goToPreviousMonth, goToNextMonth };
}
