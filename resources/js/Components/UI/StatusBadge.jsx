const statusStyles = {
    pending:    'bg-amber-100 text-amber-800',
    confirmed:  'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped:    'bg-purple-100 text-purple-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-red-100 text-red-800',
    rejected:   'bg-red-100 text-red-800',
};

export default function StatusBadge({ status, className = '' }) {
    if (!status) return null;

    const label = status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                statusStyles[status] || 'bg-gray-100 text-gray-800'
            } ${className}`}
        >
            {label}
        </span>
    );
}
