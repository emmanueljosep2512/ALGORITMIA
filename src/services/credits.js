// Utility to manage credits in LocalStorage for AlgoritmIA Beta

export const getCredits = () => {
    const credits = localStorage.getItem('algoritmia_credits');
    return credits ? parseInt(credits, 10) : 0;
};

export const hasCredits = () => {
    return getCredits() > 0;
};

export const consumeCredit = () => {
    const current = getCredits();
    if (current <= 0) {
        return false;
    }
    const next = current - 1;
    localStorage.setItem('algoritmia_credits', next.toString());
    
    // Notify sidebar and other listeners
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('creditsUpdated'));
    return true;
};

export const addCredits = (amount) => {
    const current = getCredits();
    const total = parseInt(localStorage.getItem('algoritmia_credits_total') || '0', 10);
    
    localStorage.setItem('algoritmia_credits', (current + amount).toString());
    localStorage.setItem('algoritmia_credits_total', (total + amount).toString());
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('creditsUpdated'));
};
