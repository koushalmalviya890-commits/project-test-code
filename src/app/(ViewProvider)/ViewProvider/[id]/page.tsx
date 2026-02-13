import React from 'react'
import { Metadata } from 'next'
import ViewProviderClient from './ViewProviderClient'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Service Provider Details | Cumma',
    description: 'View details about this service provider and their facilities',
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ViewProviderClient providerId={id} />
}
