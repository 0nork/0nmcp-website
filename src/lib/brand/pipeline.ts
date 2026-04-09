import { logStage } from './logStage'

// Pipeline: sequential stages, each depends on previous output
export async function runPipeline<T>(
  stages: Array<{ name: string; fn: (input: T) => Promise<T> }>,
  initialInput: T,
  subLocationId: string
): Promise<{ result: T; errors: string[] }> {
  let current = initialInput
  const errors: string[] = []

  for (const stage of stages) {
    await logStage(subLocationId, stage.name, 'started')
    const start = Date.now()
    try {
      current = await stage.fn(current)
      await logStage(subLocationId, stage.name, 'completed', Date.now() - start)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await logStage(subLocationId, stage.name, 'failed', Date.now() - start, msg)
      errors.push(`${stage.name}: ${msg}`)
      break
    }
  }

  return { result: current, errors }
}

// Assembly Line: parallel independent tasks
export async function runAssemblyLine<R>(
  tasks: Array<{ name: string; fn: () => Promise<R> }>,
  subLocationId: string
): Promise<Array<{ name: string; result: R | null; error: string | null }>> {
  const results = await Promise.allSettled(tasks.map(t => t.fn()))

  return tasks.map((task, i) => {
    const result = results[i]
    if (result.status === 'fulfilled') {
      return { name: task.name, result: result.value, error: null }
    }
    const msg = result.reason instanceof Error ? result.reason.message : String(result.reason)
    return { name: task.name, result: null, error: msg }
  })
}
