import type { Track } from '../types/timeline'

export class TimelineHistory {
  private stack: Track[][] = []
  private pointer = -1
  private maxSize: number

  constructor(maxSize = 50) {
    this.maxSize = maxSize
  }

  push(tracks: Track[]) {
    const snapshot = JSON.parse(JSON.stringify(tracks))
    this.stack = this.stack.slice(0, this.pointer + 1)
    this.stack.push(snapshot)
    if (this.stack.length > this.maxSize) {
      this.stack.shift()
    }
    this.pointer = this.stack.length - 1
  }

  undo(): Track[] | null {
    if (!this.canUndo()) return null
    this.pointer--
    return JSON.parse(JSON.stringify(this.stack[this.pointer]))
  }

  redo(): Track[] | null {
    if (!this.canRedo()) return null
    this.pointer++
    return JSON.parse(JSON.stringify(this.stack[this.pointer]))
  }

  canUndo(): boolean {
    return this.pointer >= 0
  }

  canRedo(): boolean {
    return this.pointer < this.stack.length - 1
  }

  clear() {
    this.stack = []
    this.pointer = -1
  }
}
