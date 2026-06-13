/**
 * Derive outbound message delivery status from API fields.
 */
export function deriveMessageStatus(message, currentUserId) {
    if (message.sender_id !== currentUserId) {
        return undefined;
    }

    if (message.status === 'sending' || message.status === 'failed') {
        return message.status;
    }

    if (message.status && ['sent', 'delivered', 'read'].includes(message.status)) {
        return message.status;
    }

    if (message.is_read || message.read_at) {
        return 'read';
    }

    if (message.delivered_at) {
        return 'delivered';
    }

    return 'sent';
}

export function withDeliveryStatus(messages, currentUserId) {
    return messages.map((m) => ({
        ...m,
        status: deriveMessageStatus(m, currentUserId),
    }));
}
