import React from "react";
import { Metadata } from "next";
import ViewProviderClient from "./ViewProviderClient";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    affiliateId: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Service Provider Details | Cumma",
    description: "View details about this service provider and their facilities",
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { affiliateId } = await searchParams;

  return (
    <ViewProviderClient
      providerId={id}
      affiliateId={affiliateId}
    />
  );
}
