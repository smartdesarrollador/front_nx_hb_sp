import AppLayoutClient from '@/features/app/AppLayoutClient'

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>
}
