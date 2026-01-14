import React from "react";
import { Metadata } from "next";
import ViewProviderClient from "./ViewProviderClient";

type Props = {
  params: {
    id: string;
  };
  searchParams: {
    affiliateId: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Service Provider Details | Cumma",
    description: "View details about this service provider and their facilities",
  };
}

export default function Page({ params, searchParams }: Props) {
  //// console.log(params.id, "provider id from params");
  //// console.log(searchParams.affiliateId, "affiliate id from query");

  return (
    <ViewProviderClient
      providerId={params.id}
      affiliateId={searchParams.affiliateId}
    />
  );
}
