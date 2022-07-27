export enum FocusDirection {
  Next = 'next',
  Previous = 'previous',
  First = 'first',
  Last = 'last',
  StartsWith = 'startsWith',
}

export type MoveFocusSignature = {
  (focusTarget: FocusDirection.First | FocusDirection.Last | number): void;
  (
    focusTarget: FocusDirection.Next | FocusDirection.Previous,
    currentIndex: number
  ): void;
  (
    focusTarget: FocusDirection.StartsWith,
    currentIndex: number,
    char: string
  ): void;
};
