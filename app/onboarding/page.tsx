// app/onboarding/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OnboardingClient from './OnboardingClient'

export const metadata = {
  title: 'Set Up Your Plan — FitFuel',
  description: 'Tell us about yourself so we can personalise your meal plan and calorie targets.',
}

export default async function OnboardingPage() {
  const session = await auth()

  // Not logged in → send to sign in
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/onboarding')
  }

  const userId = session.user.id

  // Already onboarded → send to dashboard
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { onboardingComplete: true },
  })

  if (profile?.onboardingComplete) {
    redirect('/dashboard')
  }

  return (
    <OnboardingClient
      userName={session.user.name ?? ''}
      userEmail={session.user.email ?? ''}
      userImage={session.user.image ?? ''}
    />
  )
}