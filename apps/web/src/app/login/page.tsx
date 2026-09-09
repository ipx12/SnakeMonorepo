import { LoginForm } from '@/components/auth/LoginForm';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Watermelon UI',
  description: 'Sign in to access your Watermelon UI dashboard',
};

export default function LoginPage() {
  return <LoginForm />;
}
