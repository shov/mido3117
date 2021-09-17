export class EventBus {
    private store: TDict = {}

    public on(name: string, cb: (msg: string) => void) {
        if (!Array.isArray(this.store[name])) {
            this.store[name] = []
        }

        this.store[name].push(cb)
    }

    public emit(name: string, ...args: any[]) {
        ;(this.store[name] || [])
            .forEach((cb: (...args: any) => any) => Promise.resolve(cb(...args))
                .catch(e => this.emit('error', `Event listener for ${name} failed!`)))
    }
}
