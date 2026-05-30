import { useTranslations } from 'next-intl';
export default function Page() {
  const t = useTranslations("test");
  return (
    <div>{t('title')}</div>
  )
}
