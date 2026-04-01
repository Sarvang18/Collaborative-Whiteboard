import { Operation } from '../types/operations'

export class OperationQueue {
  private queue: Operation[] = []
  private flushRaf: number | null = null
  private emitFn: (ops: Operation[]) => void

  constructor(emitFn: (ops: Operation[]) => void) {
    this.emitFn = emitFn
  }

  enqueue(op: Operation) {
    this.queue.push(op)
    if (!this.flushRaf) {
      this.flushRaf = requestAnimationFrame(() => this.flush())
    }
  }

  private flush() {
    if (this.queue.length) {
      this.emitFn(this.queue)
      this.queue = []
    }
    this.flushRaf = null
  }

  destroy() {
    if (this.flushRaf) {
      cancelAnimationFrame(this.flushRaf)
    }
  }
}
