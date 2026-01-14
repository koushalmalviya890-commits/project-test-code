// File: app/api/fix-invoice/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import ServiceProvider from '@/models/ServiceProvider'
import mongoose from 'mongoose'

export async function POST() {
  try {
    await connectDB()
    const userId = new mongoose.Types.ObjectId('68692d69c0c8aa9f8280d322')

    const result = await ServiceProvider.updateOne(
      { userId },
      { $set: { invoiceType: 'cumma' } }
    )

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
