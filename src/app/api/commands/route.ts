import { NextResponse } from 'next/server'
import { COMMANDS, CATEGORIES } from '@/app/commands/commands'

export async function GET() {
  return NextResponse.json({
    commands: COMMANDS.map(cmd => ({
      id: cmd.id,
      title: cmd.title,
      description: cmd.description,
      category: cmd.category,
      services: cmd.services,
      slackPrompt: cmd.slackPrompt,
      tags: cmd.tags,
      isPower: cmd.isPower || false,
      isFree: cmd.isFree || false,
    })),
    categories: CATEGORIES,
    total: COMMANDS.length,
  })
}
