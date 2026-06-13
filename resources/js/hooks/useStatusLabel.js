import useTranslation from '@/hooks/useTranslation';

export default function useStatusLabel() {
    const { t } = useTranslation();

    return (status) => {
        if (! status) {
            return '';
        }

        const key = `status.${String(status).toLowerCase()}`;

        return t(key) !== key ? t(key) : status;
    };
}
