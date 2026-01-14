import React from 'react'
import { Metadata } from 'next'
import ViewProviderClient from './ViewProviderClient'

type Props = {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Service Provider Details | Cumma',
    description: 'View details about this service provider and their facilities',
  }
}

export default function Page({ params }: Props) {
  return <ViewProviderClient providerId={params.id} />
}
