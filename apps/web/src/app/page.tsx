import { DashboardContainer } from '@/components/dashboard/DashboardContainer';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Watermelon UI',
  description: 'Manage your personal tasks',
};

export default function Home() {
  return <DashboardContainer />;
}
