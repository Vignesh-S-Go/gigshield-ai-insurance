// IST (India Standard Time) utility functions
// IST = UTC + 5:30

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

export function getIST() {
    return new Date(new Date().getTime() + IST_OFFSET);
}

export function toIST(date) {
    return new Date(new Date(date).getTime() + IST_OFFSET);
}

export function formatIST(date, options = {}) {
    const istDate = toIST(date);
    return istDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        ...options
    });
}

export function addMinutesIST(date, minutes) {
    return new Date(new Date(date).getTime() + (minutes * 60 * 1000));
}

export function isExpiredIST(expiryDate) {
    return new Date() > new Date(expiryDate);
}

export function getISTDate() {
    const now = new Date();
    return new Date(now.getTime() + IST_OFFSET);
}

export function getISTISODate() {
    return getISTDate().toISOString();
}

export function normalizePhone(phone) {
    if (!phone) return null;
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.length === 10) {
        return `+91 ${cleaned}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+91 ${cleaned.slice(2)}`;
    }
    return phone;
}
