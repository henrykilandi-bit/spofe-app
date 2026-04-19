export interface EventStorePort {
  append(event: unknown): Promise<void>;
}