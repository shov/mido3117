export class Container {
    private store: TDict = {}

    public register(name: string, resolver: any, deps = []) {
        this.store[name] = {
            resolver, deps
        }
    }

    public registerObject(name: string, reference: any) {
        this.store[name] = reference
    }

    public get(name: string): any {
        if ('function' === typeof this.store[name]?.resolver
            && this.store[name]?.resolver?.prototype?.constructor) {

            // resolve deps
            const deps = (this.store[name]?.deps || []).map((depName: string) => this.get(depName))

            // resolve
            return new (this.store[name]?.resolver)(...deps)
        }

        return this.store[name]
    }
}
