export class DelayedRunner {
  private timeoutId: number | null = null

  runDelayedFunction(callback: () => void, delayInMilliseconds: number): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      console.log('running delayed func')
      callback()
      this.timeoutId = null
    }, delayInMilliseconds)
  }

  clearTimeout(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
    }
  }
}
