export interface EventBus {
  publish(event: unknown): Promise<void>;
}