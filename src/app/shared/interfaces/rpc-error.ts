export interface RPCError extends Error {
  code: number;
  message: string;
}
