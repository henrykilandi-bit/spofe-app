export interface GuardianRule<TCommand> {
  validate(command: TCommand): void;
}
