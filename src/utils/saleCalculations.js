export const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

export const formatCurrency = (value) => `Rp ${toNumber(value).toLocaleString('id-ID')}`;

export const normalizeDiscountType = (type, value) => {
    return toNumber(value) > 0 ? type || null : null;
};

export const normalizeDiscountValue = (value) => {
    return toNumber(value) > 0 ? toNumber(value) : null;
};

export const calculateDiscountAmount = (baseAmount, discountType, discountValue) => {
    const base = toNumber(baseAmount);
    const value = toNumber(discountValue);

    if (!discountType || value <= 0 || base <= 0) {
        return 0;
    }

    if (discountType === 'percent') {
        return Math.min(base, Math.round(base * Math.min(value, 100) / 100));
    }

    return Math.min(base, value);
};

export const calculateProductTotals = (product) => {
    const subtotalBeforeDiscount = toNumber(product.subtotal_before_discount) || (toNumber(product.price) * toNumber(product.qty));
    const discountAmount = product.discount_amount !== undefined && product.discount_amount !== null
        ? toNumber(product.discount_amount)
        : calculateDiscountAmount(subtotalBeforeDiscount, product.discount_type, product.discount_value);
    const subtotal = product.subtotal !== undefined && product.subtotal !== null
        ? toNumber(product.subtotal)
        : Math.max(subtotalBeforeDiscount - discountAmount, 0);

    return {
        subtotalBeforeDiscount,
        discountAmount,
        subtotal,
    };
};

export const calculateSaleTotals = (products, discountType, discountValue) => {
    const itemTotals = products.map(calculateProductTotals);
    const subtotalBeforeItemDiscount = itemTotals.reduce((sum, item) => sum + item.subtotalBeforeDiscount, 0);
    const itemDiscount = itemTotals.reduce((sum, item) => sum + item.discountAmount, 0);
    const subtotalAfterItemDiscount = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
    const transactionDiscount = calculateDiscountAmount(subtotalAfterItemDiscount, discountType, discountValue);

    return {
        subtotalBeforeItemDiscount,
        itemDiscount,
        subtotalAfterItemDiscount,
        transactionDiscount,
        total: Math.max(subtotalAfterItemDiscount - transactionDiscount, 0),
    };
};

export const formatDiscountLabel = (discountType, discountValue, discountAmount) => {
    const amount = toNumber(discountAmount);
    const value = toNumber(discountValue);

    if (discountType === 'percent' && value > 0) {
        return `${value}%`;
    }

    if (amount > 0) {
        return formatCurrency(amount);
    }

    if (discountType === 'nominal' && value > 0) {
        return formatCurrency(value);
    }

    return '-';
};
