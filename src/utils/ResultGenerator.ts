export function ResultOK(message: string, payload?: any) {
  return {
    result: "OK",
    message,
    payload,
  };
}

export function ResultWarning(message: string, payload?: any) {
  return {
    result: "WARNING",
    message,
    payload,
  };
}

export function ResultError(message: string, payload?: any) {
  return {
    result: "ERROR",
    message,
    payload,
  };
}
