import { RegisterForm } from '@/components/auth/RegisterForm';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Watermelon UI',
  description: 'Join Watermelon UI to manage tasks and features',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
