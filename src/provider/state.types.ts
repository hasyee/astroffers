export namespace State {
  export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;
  export type Selector<T, S> = (state: T) => S;
  export type Change<T> = (state: T) => any;
}
