import type { Metadata } from 'next';
import { AikobiChat } from '@/components/aikobi-chat';

export const metadata: Metadata = {
  title: 'Tanya KOBI | Chatbot Konsultan Bisnis AI Tokopedia',
  description:
    'Diskusikan strategi penetapan harga, audit kompetitor, penanganan ulasan pembeli, dan optimasi etalase Tokopedia bersama KOBI (Akal Imitasi Konsultan Bisnis).',
};

export default function TanyaPage() {
  return <AikobiChat />;
}
