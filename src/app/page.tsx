import { redirect } from 'next/navigation';

export default function RootPage() {
  // In a real app, check auth here. If not logged in:
  redirect('/login');
}
