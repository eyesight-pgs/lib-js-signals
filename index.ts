
class IndependentSignal {
  private value: any;
  private references: ComputedSignal[] = [];
  public constructor (val: any) {
    this.value = val;
  }
  public get() {
    return this.value;
  }
  public set(newValue: any) {
    try {
      this.value = newValue;
      console.log(`counter value: ` + this.get());
      for (const sig of this.references) {
        sig.setDirty();
      }
    } catch (err) {
      console.log(`Error: ref: ${this.references[0]}`);
    }
  }
  public register(sig: ComputedSignal) {
    this.references.push(sig);
  }
}
class ComputedSignal {
  private value: any;
  private dirty: boolean;
  private references: ComputedSignal[] = [];
  private computeFn: any;
  public constructor(cmpFn: any, source: IndependentSignal | ComputedSignal) {
    this.dirty = false;
    this.computeFn = cmpFn;
    this.compute();
    source.register(this);
  }
  public get() {
    if (this.dirty) {
      console.log("isEven is dirty... recomputing");
      this.compute();
      this.dirty = false;
    }
    return this.value;
  }
  public compute() {
    this.value = this.computeFn();
  }
  public setDirty() {
    this.dirty = true;
    for (const sig of this.references) {
      sig.setDirty();
    }
  }
  public register(sig: ComputedSignal) {
    this.references.push(sig);
  }
}


export class Signal {
  public state(value: any) {
    const sig = new IndependentSignal(value);
    return sig;
  }
  public computed(computeFn: any, source: IndependentSignal | ComputedSignal) {
    const sig = new ComputedSignal(computeFn, source);
    console.log(`new computed value: ` + sig.get());
    return sig;
  }
}



export function test() {
  const counter = new Signal().state(0);
  const isEven = new Signal().computed(() => counter.get() % 2 === 0, counter);
  setInterval(() => {
    const i = counter.get();
    counter.set(i + 1);
  }, 3000);
  setInterval(() => {
    console.log(`counter: ${counter.get()} | isEven: ${isEven.get()}`);
  }, 1000);
}








